import { Component, OnDestroy } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
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
  imports: [Nav, Footer, CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  shippingCost = 5000;
  discount = 0;
  couponCode = '';
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
    const subtotal = this.getSubtotal();
    const shipping = subtotal >= 50000 ? 0 : this.shippingCost;
    return subtotal + shipping - this.discount;
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

  applyCoupon(): void {
    // Simple coupon logic
    if (this.couponCode.toUpperCase() === 'DISCOUNT10') {
      this.discount = this.getSubtotal() * 0.1;
      alert('Coupon applied! 10% discount');
    } else if (this.couponCode.toUpperCase() === 'WELCOME20') {
      this.discount = this.getSubtotal() * 0.2;
      alert('Coupon applied! 20% discount');
    } else if (this.couponCode) {
      alert('Invalid coupon');
    }
  }

  proceedToCheckout(): void {
    // Navigate to a dedicated checkout / payment page
    this.router.navigate(['/checkout']);
  }

  // Cleanup subscription if component destroyed
  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
