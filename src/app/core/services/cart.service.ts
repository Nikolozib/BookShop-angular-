import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.loadCart());

  items = this._items.asReadonly();

  totalCount = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  shipping = computed(() => this.subtotal() >= 35 ? 0 : 4.99);

  total = computed(() => this.subtotal() + this.shipping());

  private loadCart(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  }

  private save() {
    localStorage.setItem('cart', JSON.stringify(this._items()));
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
      this._items().map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
    );
    this.save();
  }

  decrease(id: string) {
    const updated = this._items()
      .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
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
    localStorage.removeItem('cart');
  }
}
