import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  orderPlaced = signal(false);
  processing = signal(false);

  checkoutForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    zip: ['', Validators.required]
  });

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user?.email) {
        this.checkoutForm.patchValue({ email: user.email });
      }
      if (user?.displayName) {
        this.checkoutForm.patchValue({ name: user.displayName });
      }
    });
  }

  async placeOrder() {
    if (this.checkoutForm.invalid || this.cartService.items().length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    this.processing.set(true);
    await new Promise(r => setTimeout(r, 1500));
    this.cartService.clear();
    this.orderPlaced.set(true);
    this.processing.set(false);
  }
}
