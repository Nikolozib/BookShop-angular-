import { Injectable, inject, signal, computed } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, onSnapshot } from '@angular/fire/firestore';
import { CartItem } from '../models/book.model';

const LS_KEY = 'cart';
const COLLECTION = 'carts';

interface StoredCartV1 {
  v: 1;
  ownerUid: string | null;
  items: CartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private userUid: string | null = null;
  private unsubFirestore?: () => void;

  private _items = signal<CartItem[]>(this.loadCart());

  items = this._items.asReadonly();

  totalCount = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  shipping = computed(() => (this.subtotal() >= 35 ? 0 : 4.99));

  total = computed(() => this.subtotal() + this.shipping());

  constructor() {
    user(this.auth).subscribe(u => {
      this.unsubFirestore?.();
      this.unsubFirestore = undefined;
      const nextUid = u?.uid ?? null;
      this.userUid = nextUid;
      if (nextUid) {
        void this.attachCloudCart(nextUid);
      }
    });
  }

  private loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'items' in parsed) {
        const v1 = parsed as StoredCartV1;
        return Array.isArray(v1.items) ? v1.items : [];
      }
      if (Array.isArray(parsed)) return parsed as CartItem[];
      return [];
    } catch {
      return [];
    }
  }

  private readStoredOwner(): string | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && 'ownerUid' in parsed) {
        return (parsed as StoredCartV1).ownerUid ?? null;
      }
      return null;
    } catch {
      return null;
    }
  }

  private persistLocal() {
    const payload: StoredCartV1 = {
      v: 1,
      ownerUid: this.userUid,
      items: this._items()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }

  private mergeCarts(remote: CartItem[], local: CartItem[]): CartItem[] {
    const map = new Map<string, CartItem>();
    for (const i of remote) {
      map.set(i.id, { ...i });
    }
    for (const i of local) {
      const ex = map.get(i.id);
      if (ex) {
        map.set(i.id, { ...i, quantity: ex.quantity + i.quantity });
      } else {
        map.set(i.id, { ...i });
      }
    }
    return [...map.values()];
  }

  private normalizeItems(raw: unknown): CartItem[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (x): x is CartItem =>
        x &&
        typeof x === 'object' &&
        typeof (x as CartItem).id === 'string' &&
        typeof (x as CartItem).quantity === 'number'
    );
  }

  private async attachCloudCart(uid: string) {
    const ref = doc(this.firestore, COLLECTION, uid);
    const snap = await getDoc(ref);
    const remote = this.normalizeItems(snap.data()?.['items']);
    const lastOwner = this.readStoredOwner();
    const local = this._items();
    // Same account: localStorage is already a mirror of this user's cart — merging would double quantities.
    const merged =
      lastOwner === uid
        ? remote.length > 0
          ? remote
          : local
        : lastOwner == null
          ? this.mergeCarts(remote, local)
          : remote.length > 0
            ? remote
            : [];
    this._items.set(merged);
    this.persistLocal();
    try {
      await setDoc(ref, { items: merged, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.error('CartService: initial cloud save failed', e);
    }
    this.unsubFirestore = onSnapshot(
      ref,
      docSnap => {
        const next = this.normalizeItems(docSnap.data()?.['items']);
        this._items.set(next);
        this.persistLocal();
      },
      err => console.error('CartService: cart snapshot error', err)
    );
  }

  private async syncCloud() {
    if (!this.userUid) return;
    try {
      await setDoc(
        doc(this.firestore, COLLECTION, this.userUid),
        { items: this._items(), updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (e) {
      console.error('CartService: cloud sync failed', e);
    }
  }

  private save() {
    this.persistLocal();
    void this.syncCloud();
  }

  add(item: Omit<CartItem, 'quantity'>) {
    const current = this._items();
    const idx = current.findIndex(i => i.id === item.id);
    if (idx > -1) {
      const updated = [...current];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
      this._items.set(updated);
    } else {
      this._items.set([...current, { ...item, quantity: 1 }]);
    }
    this.save();
  }

  increase(id: string) {
    this._items.set(
      this._items().map(i => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
    this.save();
  }

  decrease(id: string) {
    const updated = this._items()
      .map(i => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
      .filter(i => i.quantity > 0);
    this._items.set(updated);
    this.save();
  }

  remove(id: string) {
    this._items.set(this._items().filter(i => i.id !== id));
    this.save();
  }

  clear() {
    this._items.set([]);
    localStorage.removeItem(LS_KEY);
    void this.syncCloud();
  }
}
