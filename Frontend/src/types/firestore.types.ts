import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'store_owner' | 'manager' | 'cashier';

export interface User {
  id?: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface Store {
  id?: string;
  ownerId: string;
  storeName: string;
  category: string;
  location: string;
  createdAt?: Timestamp;
}

export interface Product {
  id?: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt?: Timestamp;
}

export interface Sale {
  id?: string;
  storeId: string;
  productId: string;
  quantity: number;
  total: number;
  createdAt?: Timestamp;
}

export interface Inventory {
  id?: string;
  productId: string;
  currentStock: number;
  reorderLevel: number;
  updatedAt?: Timestamp;
}
