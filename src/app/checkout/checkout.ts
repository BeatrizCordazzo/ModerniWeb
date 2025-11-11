import { Component, OnDestroy, OnInit } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, SimpleCartItem } from '../shared/cart.service';
import { Datos } from '../datos';
import { Subscription } from 'rxjs';
import { ToastNotification } from '../shared/toast-notification/toast-notification';

@Component({
  selector: 'app-checkout',
  imports: [Nav, Footer, FormsModule, ToastNotification],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit, OnDestroy {
  cartItems: SimpleCartItem[] = [];
  private sub: Subscription | null = null;
  loading = false;
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Simple mock payment fields
  cardName = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(private cartService: CartService, private datos: Datos, private router: Router) {}

  ngOnInit(): void {
    // read current cart items
    this.sub = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });
    // Make navbar solid for checkout so it's readable on white background
    try {
      document && document.body && document.body.classList.add('solid-navbar');
    } catch (e) {
      // ignore for server-side rendering or tests
    }
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    try {
      document && document.body && document.body.classList.remove('solid-navbar');
    } catch (e) {
      // ignore
    }
  }

  getSubtotal(): number {
    return this.cartItems.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const shipping = subtotal >= 50000 ? 0 : 5000;
    return subtotal + shipping;
  }

  confirmPayment(): void {
    if (this.cartItems.length === 0) return;
    // In a real app you'd integrate with a payment gateway here.
    // We'll simulate payment confirmation and then create the custom order(s) on the backend.
    this.loading = true;

    const payload: any = {
      title: 'Pedido desde carrito - ' + new Date().toISOString(),
      description: 'Pedido generado desde el carrito de compras',
      furniture: this.cartItems.map(it => ({
        name: it.name,
        quantity: it.quantity || 1,
        price: it.price,
        image: it.image,
        color: it.selectedColor,
        dimensions: (it as any).dimensions || null
      })),
      // if any cart item includes a space/dimensions object, include it at top-level
      spaceDimensions: (() => {
        const it = this.cartItems.find(i => (i as any).dimensions && typeof (i as any).dimensions === 'object');
        return it ? (it as any).dimensions : null;
      })(),
      totalPrice: this.getTotal()
    };

    this.datos.createOrder(payload).subscribe({
      next: (res) => {
        this.loading = false;
        // success: clear cart and navigate home
        this.cartService.clear();
        this.toastType = 'success';
        this.toastMessage = 'Pago confirmado. Tu pedido fue enviado correctamente.';
        this.toastVisible = true;
        // give the toast a bit of time then navigate
        setTimeout(() => {
          this.toastVisible = false;
          this.router.navigate(['/']);
        }, 1400);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creating order', err);
        this.toastType = 'error';
        this.toastMessage = 'Error al procesar el pago. Intenta nuevamente.';
        this.toastVisible = true;
      }
    });
  }
}
