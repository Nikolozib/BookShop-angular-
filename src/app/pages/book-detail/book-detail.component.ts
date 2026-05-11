import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BooksService } from '../../core/services/books.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Book } from '../../core/models/book.model';
import { BookCardComponent } from '../../shared/book-card/book-card.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private booksService = inject(BooksService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  book = signal<Book | null>(null);
  related = signal<Book[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const book = await this.booksService.getBook(id);
    this.book.set(book);
    this.loading.set(false);

    if (book) {
      const all = await this.booksService.getBooks({ genre: book.genre });
      this.related.set(all.filter(b => b.id !== id).slice(0, 4));
    }
  }

  addToCart() {
    const b = this.book();
    if (!b) return;
    this.cartService.add({ id: b.id, title: b.title, price: b.price, image: b.imageUrl || '' });
    this.toastService.show(`"${b.title}" added to cart`);
  }
}
