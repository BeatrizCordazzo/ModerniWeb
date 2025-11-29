import { Component, OnDestroy } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';

import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService, SimpleCartItem } from '../shared/cart.service';
import { Subscription } from 'rxjs';

interface CartItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-cart',
  imports: [Nav, Footer, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  cartItems: CartItem[] = [];
  private sub: Subscription | null = null;

  constructor(private cartService: CartService, private router: Router) {
    this.sub = this.cartService.items$.subscribe(items => {
      // Map SimpleCartItem to CartItem used by template
      this.cartItems = items.map((it, idx) => ({
        id: idx,
        name: it.name,
        description: it.description || '',
        category: '',
        price: it.price,
        quantity: it.quantity || 1,
        image: it.image
      }));
    });
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotal(): number {
    return this.getSubtotal();
  }

  increaseQuantity(itemId: number): void {
    const idx = itemId;
    const item = this.cartItems[idx];
    if (item && item.quantity < 99) {
      this.cartService.updateQuantity(idx, item.quantity + 1);
    }
  }

  decreaseQuantity(itemId: number): void {
    const idx = itemId;
    const item = this.cartItems[idx];
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(idx, item.quantity - 1);
    }
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    const idx = itemId;
    this.cartService.updateQuantity(idx, newQuantity);
  }

  removeItem(itemId: number): void {
    const idx = itemId;
    this.cartService.removeItem(idx);
  }

  // applyCoupon removed — coupons are not used

  proceedToCheckout(): void {
    // Navigate to a dedicated checkout / payment page
    this.router.navigate(['/checkout']);
  }

  // Cleanup subscription if component destroyed
  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
