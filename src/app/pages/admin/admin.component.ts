import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BooksService } from '../../core/services/books.service';
import { StorageService } from '../../core/services/storage.service';
import { Book } from '../../core/models/book.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  private booksService = inject(BooksService);
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);

  books = signal<Book[]>([]);
  loading = signal(true);
  saving = signal(false);
  editingId = signal<string | null>(null);
  adminMsg = signal('');
  adminMsgType = signal<'success' | 'error'>('success');
  selectedFile: File | null = null;

  genres = ['Fiction','Non-Fiction','Mystery','Thriller','Science','History','Biography','Romance','Fantasy','Self-Help','Children','Classic'];

  bookForm = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    genre: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [null as number | null],
    description: [''],
    pages: [''],
    publisher: [''],
    isbn: [''],
    language: ['English'],
    isNew: [false],
    isSale: [false]
  });

  async ngOnInit() {
    await this.loadBooks();
  }

  async loadBooks() {
    this.loading.set(true);
    this.books.set(await this.booksService.getBooks());
    this.loading.set(false);
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  async save() {
    if (this.bookForm.invalid) return;
    this.saving.set(true);

    const data: Partial<Book> = {
      title: this.bookForm.value.title!,
      author: this.bookForm.value.author!,
      genre: this.bookForm.value.genre!,
      price: Number(this.bookForm.value.price),
      originalPrice: this.bookForm.value.originalPrice ? Number(this.bookForm.value.originalPrice) : null,
      description: this.bookForm.value.description || '',
      pages: this.bookForm.value.pages || '',
      publisher: this.bookForm.value.publisher || '',
      isbn: this.bookForm.value.isbn || '',
      language: this.bookForm.value.language || 'English',
      isNew: this.bookForm.value.isNew || false,
      isSale: this.bookForm.value.isSale || false,
    };

    if (this.selectedFile) {
      try {
        data.imageUrl = await this.storageService.uploadBookCover(this.selectedFile);
      } catch {
        this.showMsg('Image upload failed.', 'error');
        this.saving.set(false);
        return;
      }
    }

    try {
      if (this.editingId()) {
        await this.booksService.updateBook(this.editingId()!, data);
        this.showMsg('Book updated successfully!', 'success');
      } else {
        await this.booksService.addBook(data);
        this.showMsg('Book added successfully!', 'success');
      }
      this.cancelEdit();
      await this.loadBooks();
    } catch {
      this.showMsg('Error saving book.', 'error');
    }
    this.saving.set(false);
  }

  startEdit(book: Book) {
    this.editingId.set(book.id);
    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: book.price,
      originalPrice: book.originalPrice || null,
      description: book.description || '',
      pages: book.pages || '',
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      language: book.language || 'English',
      isNew: book.isNew || false,
      isSale: book.isSale || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.bookForm.reset({ language: 'English', isNew: false, isSale: false });
    this.selectedFile = null;
  }

  async deleteBook(id: string) {
    if (!confirm('Delete this book? This cannot be undone.')) return;
    try {
      await this.booksService.deleteBook(id);
      this.showMsg('Book deleted.', 'success');
      await this.loadBooks();
    } catch {
      this.showMsg('Error deleting book.', 'error');
    }
  }

  private showMsg(text: string, type: 'success' | 'error') {
    this.adminMsg.set(text);
    this.adminMsgType.set(type);
    setTimeout(() => this.adminMsg.set(''), 4000);
  }
}
