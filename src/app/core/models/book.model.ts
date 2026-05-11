export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  originalPrice?: number | null;
  description?: string;
  imageUrl?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  language?: string;
  isNew?: boolean;
  isSale?: boolean;
  createdAt?: string;
  quantity?: number;
  rating?: number;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}
