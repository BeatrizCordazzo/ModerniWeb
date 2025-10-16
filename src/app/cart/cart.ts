import { Component } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Mesa de Comedor Moderna',
      description: 'Mesa de madera maciza con diseño minimalista',
      category: 'Comedor',
      price: 45000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300'
    },
    {
      id: 2,
      name: 'Sillón Escandinavo',
      description: 'Sillón de estilo nórdico con tapizado premium',
      category: 'Living',
      price: 35000,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300'
    },
    {
      id: 3,
      name: 'Lámpara de Pie Moderna',
      description: 'Iluminación LED regulable con diseño contemporáneo',
      category: 'Iluminación',
      price: 12000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300'
    }
  ];

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
    const item = this.cartItems.find(i => i.id === itemId);
    if (item && item.quantity < 99) {
      item.quantity++;
    }
  }

  decreaseQuantity(itemId: number): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity--;
    }
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, Math.min(99, newQuantity));
    }
  }

  removeItem(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
  }

  applyCoupon(): void {
    // Lógica simple de cupones
    if (this.couponCode.toUpperCase() === 'DESCUENTO10') {
      this.discount = this.getSubtotal() * 0.1;
      alert('¡Cupón aplicado! 10% de descuento');
    } else if (this.couponCode.toUpperCase() === 'WELCOME20') {
      this.discount = this.getSubtotal() * 0.2;
      alert('¡Cupón aplicado! 20% de descuento');
    } else if (this.couponCode) {
      alert('Cupón no válido');
    }
  }

  proceedToCheckout(): void {
    console.log('Procediendo al pago...');
    alert('¡Redirigiendo al proceso de pago!');
    // Aquí iría la lógica para proceder al checkout
  }
}
