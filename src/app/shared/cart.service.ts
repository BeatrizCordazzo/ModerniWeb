import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SimpleCartItem {
  id?: number;
  name: string;
  description?: string;
  price: number;
  image: string;
  selectedColor?: { name: string; code: string };
  quantity?: number;
  // optional dimensions for items that represent a furniture/set adapted to a space
  dimensions?: { width?: number | string; height?: number | string; depth?: number | string } | any;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = 'moderni_cart_v1';
  private itemsSubject = new BehaviorSubject<SimpleCartItem[]>(this.loadFromStorage());
  items$ = this.itemsSubject.asObservable();

  private loadFromStorage(): SimpleCartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      return JSON.parse(raw) as SimpleCartItem[];
    } catch (e) {
      console.warn('Error reading cart from localStorage', e);
      return [];
    }
  }

  private saveToStorage(items: SimpleCartItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving cart to localStorage', e);
    }
  }

  getItems(): SimpleCartItem[] {
    return this.itemsSubject.getValue();
  }

  addItem(item: SimpleCartItem) {
    const items = this.getItems();
    console.log('CartService.addItem called with', item, 'current items:', items);
    // Try to merge by name + color
    const existing = items.find(i => i.name === item.name && JSON.stringify(i.selectedColor) === JSON.stringify(item.selectedColor));
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      items.push({ ...item, quantity: item.quantity || 1 });
    }
    this.itemsSubject.next([...items]);
    this.saveToStorage(items);
    console.log('CartService: saved items', items);
  }

  updateQuantity(indexOrPredicate: number | ((it: SimpleCartItem) => boolean), quantity: number) {
    const items = this.getItems();
    if (typeof indexOrPredicate === 'number') {
      const idx = indexOrPredicate;
      if (items[idx]) items[idx].quantity = Math.max(1, Math.min(99, quantity));
    } else {
      const predicate = indexOrPredicate;
      const item = items.find(predicate);
      if (item) item.quantity = Math.max(1, Math.min(99, quantity));
    }
    this.itemsSubject.next([...items]);
    this.saveToStorage(items);
  }

  removeItem(predicate: number | ((it: SimpleCartItem) => boolean)) {
    let items = this.getItems();
    if (typeof predicate === 'number') {
      items = items.filter((_, idx) => idx !== predicate);
    } else {
      items = items.filter(i => !predicate(i));
    }
    this.itemsSubject.next([...items]);
    this.saveToStorage(items);
  }

  clear() {
    this.itemsSubject.next([]);
    this.saveToStorage([]);
  }
}
