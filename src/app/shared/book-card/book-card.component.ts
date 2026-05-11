import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Book } from '../../core/models/book.model';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss']
})
export class BookCardComponent {
  @Input() book!: Book;
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  addToCart(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.cartService.add({
      id: this.book.id,
      title: this.book.title,
      price: this.book.price,
      image: this.book.imageUrl || ''
    });
    this.toastService.show(`"${this.book.title}" added to cart`);
  }
}
