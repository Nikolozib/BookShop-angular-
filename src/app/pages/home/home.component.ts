import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BooksService } from '../../core/services/books.service';
import { Book } from '../../core/models/book.model';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private booksService = inject(BooksService);

  featuredBooks = signal<Book[]>([]);
  newArrivals = signal<Book[]>([]);
  genres = signal<string[]>([]);
  selectedGenre = signal('all');
  loading = signal(true);
  newsletterEmail = '';
  newsletterMsg = signal('');

  async ngOnInit() {
    this.loading.set(true);
    const [featured, arrivals, genres] = await Promise.all([
      this.booksService.getBooks({ limit: 4, sort: 'newest' }),
      this.booksService.getBooks({ limit: 4 }),
      this.booksService.getGenres()
    ]);
    this.featuredBooks.set(featured);
    this.newArrivals.set(arrivals);
    this.genres.set(genres);
    this.loading.set(false);
  }

  async filterGenre(genre: string) {
    this.selectedGenre.set(genre);
    this.loading.set(true);
    const books = await this.booksService.getBooks({ genre, limit: 4 });
    this.featuredBooks.set(books);
    this.loading.set(false);
  }

  submitNewsletter() {
    if (!this.newsletterEmail) return;
    this.newsletterMsg.set('Thank you for subscribing! Your 15% discount code: PAGETURN15');
    this.newsletterEmail = '';
  }
}
