import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  currentUser$ = user(this.auth);

  async register(name: string, email: string, password: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(this.firestore, 'users', cred.user.uid), {
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async getUserRole(uid: string): Promise<string> {
    try {
      const snap = await getDoc(doc(this.firestore, 'users', uid));
      return snap.exists() ? (snap.data()['role'] as string) : 'user';
    } catch {
      return 'user';
    }
  }

  async isAdmin(): Promise<boolean> {
    const u = this.auth.currentUser;
    if (!u) return false;
    const role = await this.getUserRole(u.uid);
    return role === 'admin';
  }
}
