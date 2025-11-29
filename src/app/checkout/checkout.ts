import { Component, OnDestroy, OnInit } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, SimpleCartItem } from '../shared/cart.service';
import { Datos } from '../datos';
import { Subscription } from 'rxjs';
import { ToastNotification } from '../shared/toast-notification/toast-notification';
import { InvoiceService, InvoiceSpaceDimensions } from '../shared/invoice.service';

interface LoggedUser {
  id?: number;
  nombre?: string;
  name?: string;
  email?: string;
  telefono?: string;
  phone?: string;
  rol?: string;
  direccion?: string | null;
  address?: string | null;
  memberSince?: string | null;
}

@Component({
  selector: 'app-checkout',
  imports: [Nav, Footer, FormsModule, ToastNotification],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit, OnDestroy {
  cartItems: SimpleCartItem[] = [];
  private sub: Subscription | null = null;
  private userSub: Subscription | null = null;
  loading = false;
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  loggedUser: LoggedUser | null = null;

  // Simple mock payment fields
  cardName = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(
    private cartService: CartService,
    private datos: Datos,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    // read current cart items
    this.sub = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });
    this.userSub = this.datos.getLoggedUser().subscribe({
      next: user => {
        this.loggedUser = user && typeof user === 'object' ? (user as LoggedUser) : null;
      },
      error: () => {
        this.loggedUser = null;
      }
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
    if (this.userSub) this.userSub.unsubscribe();
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
    return this.getSubtotal();
  }

  confirmPayment(): void {
    if (this.cartItems.length === 0) return;
    // we simulate the payment confirmation and then we create the custom order on the backend
    this.loading = true;
    const cartSnapshot = [...this.cartItems];

    const payload: any = {
      title: 'Order from cart - ' + new Date().toISOString(),
      description: 'Order generated from shopping cart',
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
        const orderId = res?.pedido_id ?? res?.id ?? Date.now();
        this.generateInvoice(orderId, cartSnapshot, payload.spaceDimensions, payload.description);
        this.loading = false;
        // success: clear cart and navigate home
        this.cartService.clear();
        this.toastType = 'success';
        this.toastMessage = 'Payment confirmed. Your order has been successfully shipped..';
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
        this.toastMessage = 'Error processing payment. Please try again.';
        this.toastVisible = true;
      }
    });
  }

  private generateInvoice(
    orderId: number | string,
    items: SimpleCartItem[],
    spaceDimensions: InvoiceSpaceDimensions | null | undefined,
    orderNotes?: string | null
  ): void {
    try {
      const subtotal = items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );
      const shipping = 0; // Shipping not used
      const dims: InvoiceSpaceDimensions | null =
        (spaceDimensions && typeof spaceDimensions === 'object' && spaceDimensions) ||
        this.extractDimensionsFromItems(items);
      const userName =
        this.loggedUser?.nombre ||
        this.loggedUser?.name ||
        this.cardName ||
        'Moderni Client';
      const userPhone = this.loggedUser?.telefono || this.loggedUser?.phone || null;
      const billingAddress =
        this.loggedUser?.direccion || this.loggedUser?.address || null;

      this.invoiceService.generateOrderInvoice({
        orderId,
        orderDate: new Date(),
        customer: {
          name: userName,
          email: this.loggedUser?.email || null,
          phone: userPhone,
        },
        paymentInfo: {
          method: 'Credit Card',
          cardHolder: this.cardName || this.loggedUser?.nombre || 'Moderni Client',
          lastDigits: this.extractCardDigits(this.cardNumber),
        },
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          unitPrice: item.price || 0,
          description: item.description || null,
          color: item.selectedColor?.name || null,
        })),
        subtotal,
        shipping,
        total: subtotal,
        notes:
          orderNotes ||
          'Invoice automatically generated from Moderni checkout. Keep this receipt.',
        spaceDimensions: dims,
        billingAddress,
      });
    } catch (error) {
      console.error('Error generating order invoice', error);
    }
  }

  private extractDimensionsFromItems(items: SimpleCartItem[]): InvoiceSpaceDimensions | null {
    const withDimensions = items.find(
      item => item.dimensions && typeof item.dimensions === 'object'
    );
    return withDimensions ? (withDimensions.dimensions as InvoiceSpaceDimensions) : null;
  }

  private extractCardDigits(value: string): string | null {
    const digits = (value || '').replace(/\D+/g, '');
    return digits ? digits.slice(-4) : null;
  }
}
