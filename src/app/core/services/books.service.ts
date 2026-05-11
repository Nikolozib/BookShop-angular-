import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, limit, orderBy } from '@angular/fire/firestore';
import { Book } from '../models/book.model';

export interface BookFilters {
  genre?: string;
  search?: string;
  sort?: string;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  private firestore = inject(Firestore);
  private COLLECTION = 'Books';

  private normalize(id: string, data: any): Book {
    return {
      id,
      title: data['title'] || data['name'] || 'Untitled',
      author: data['author'] || 'Unknown',
      genre: data['genre'] || 'General',
      price: data['price'] || 0,
      originalPrice: data['originalPrice'] || null,
      imageUrl: data['imageUrl'] || data['coverImage'] || data['image'] || '',
      description: data['description'] || '',
      pages: data['pages'] || '',
      publisher: data['publisher'] || '',
      isbn: data['isbn'] || '',
      language: data['language'] || 'English',
      isNew: data['isNew'] || false,
      isSale: data['isSale'] || false,
      createdAt: data['createdAt'] || '',
      quantity: data['quantity'] || null,
      rating: data['rating'] || null
    };
  }

  async getBooks(filters: BookFilters = {}): Promise<Book[]> {
    try {
      const col = collection(this.firestore, this.COLLECTION);
      const snap = await getDocs(col);
      let books: Book[] = [];
      snap.forEach(d => books.push(this.normalize(d.id, d.data())));

      if (filters.genre && filters.genre !== 'all') {
        books = books.filter(b => b.genre === filters.genre);
      }

      if (filters.search) {
        const s = filters.search.toLowerCase();
        books = books.filter(b =>
          b.title.toLowerCase().includes(s) ||
          b.author.toLowerCase().includes(s) ||
          b.genre.toLowerCase().includes(s)
        );
      }

      if (filters.sort === 'price-asc') books.sort((a, b) => a.price - b.price);
      else if (filters.sort === 'price-desc') books.sort((a, b) => b.price - a.price);
      else if (filters.sort === 'title') books.sort((a, b) => a.title.localeCompare(b.title));
      else books.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

      if (filters.limit) books = books.slice(0, filters.limit);

      return books;
    } catch (err) {
      console.error('getBooks error:', err);
      return [];
    }
  }

  async getBook(id: string): Promise<Book | null> {
    try {
      const snap = await getDoc(doc(this.firestore, this.COLLECTION, id));
      if (!snap.exists()) return null;
      return this.normalize(snap.id, snap.data());
    } catch {
      return null;
    }
  }

  async getGenres(): Promise<string[]> {
    const books = await this.getBooks();
    return [...new Set(books.map(b => b.genre).filter(Boolean))].sort();
  }

  async addBook(data: Partial<Book>): Promise<void> {
    await addDoc(collection(this.firestore, this.COLLECTION), {
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  async updateBook(id: string, data: Partial<Book>): Promise<void> {
    await updateDoc(doc(this.firestore, this.COLLECTION, id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteBook(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, this.COLLECTION, id));
  }
}
