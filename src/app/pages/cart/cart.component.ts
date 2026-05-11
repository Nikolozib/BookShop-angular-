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
    name: ['Jon Doe', Validators.required],
    email: ['JonDoe@gmail.com', [Validators.required, Validators.email]],
    address: ['500 Book Street', Validators.required],
    city: ['San Francisco', Validators.required],
    zip: ['94158', Validators.required]
  });

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.checkoutForm.patchValue({ email: user.email || '' });
      }
    });
  }

  async placeOrder() {
    if (this.checkoutForm.invalid || this.cartService.items().length === 0) return;
    this.processing.set(true);
    await new Promise(r => setTimeout(r, 1500));
    this.cartService.clear();
    this.orderPlaced.set(true);
    this.processing.set(false);
  }
}
