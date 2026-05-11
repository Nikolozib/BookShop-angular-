import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooksService } from '../../core/services/books.service';
import { Book } from '../../core/models/book.model';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  private booksService = inject(BooksService);
  private route = inject(ActivatedRoute);

  books = signal<Book[]>([]);
  genres = signal<string[]>([]);
  loading = signal(true);
  sidebarOpen = signal(false);

  selectedGenre = signal('all');
  searchQuery = signal('');
  sortOption = signal('newest');

  async ngOnInit() {
    const genreParam = this.route.snapshot.queryParamMap.get('genre');
    if (genreParam) this.selectedGenre.set(genreParam);
    await this.loadGenres();
    await this.loadBooks();
  }

  async loadGenres() {
    const genres = await this.booksService.getGenres();
    this.genres.set(genres);
  }

  async loadBooks() {
    this.loading.set(true);
    const books = await this.booksService.getBooks({
      genre: this.selectedGenre(),
      search: this.searchQuery(),
      sort: this.sortOption()
    });
    this.books.set(books);
    this.loading.set(false);
  }

  async selectGenre(genre: string) {
    this.selectedGenre.set(genre);
    await this.loadBooks();
  }

  async onSortChange(event: Event) {
    this.sortOption.set((event.target as HTMLSelectElement).value);
    await this.loadBooks();
  }

  async search() {
    await this.loadBooks();
  }

  async onSearchKey(event: KeyboardEvent) {
    if (event.key === 'Enter') await this.search();
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
