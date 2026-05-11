import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab = signal<'login' | 'register'>('login');
  loginMsg = signal('');
  registerMsg = signal('');
  loginError = signal(false);
  registerError = signal(false);
  showLoginPwd = signal(false);
  showRegPwd = signal(false);
  showRegConfirm = signal(false);
  loading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required]
  });

  setTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    this.loginMsg.set('');
    this.registerMsg.set('');
  }

  toggleLoginPwd() { this.showLoginPwd.set(!this.showLoginPwd()); }
  toggleRegPwd() { this.showRegPwd.set(!this.showRegPwd()); }
  toggleRegConfirm() { this.showRegConfirm.set(!this.showRegConfirm()); }

  async login() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    try {
      await this.authService.login(
        this.loginForm.value.email!,
        this.loginForm.value.password!
      );
      this.router.navigate(['/']);
    } catch (err: any) {
      this.loginMsg.set(this.getError(err.code));
      this.loginError.set(true);
    }
    this.loading.set(false);
  }

  async register() {
    if (this.registerForm.invalid) return;
    const { name, email, password, confirm } = this.registerForm.value;
    if (password !== confirm) {
      this.registerMsg.set('Passwords do not match.');
      this.registerError.set(true);
      return;
    }
    this.loading.set(true);
    try {
      await this.authService.register(name!, email!, password!);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.registerMsg.set(this.getError(err.code));
      this.registerError.set(true);
    }
    this.loading.set(false);
  }

  async forgotPassword() {
    const email = this.loginForm.value.email;
    if (!email) {
      this.loginMsg.set('Enter your email first.');
      this.loginError.set(true);
      return;
    }
    try {
      await this.authService.resetPassword(email);
      this.loginMsg.set('Password reset email sent!');
      this.loginError.set(false);
    } catch (err: any) {
      this.loginMsg.set(this.getError(err.code));
      this.loginError.set(true);
    }
  }

  private getError(code: string): string {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password is too weak.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
      'auth/invalid-credential': 'Invalid email or password.'
    };
    return map[code] || 'Something went wrong. Please try again.';
  }
}
