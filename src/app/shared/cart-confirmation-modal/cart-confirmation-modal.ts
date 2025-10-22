import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CartItem {
  name: string;
  description?: string;
  price: number;
  image: string;
  selectedColor?: {
    name: string;
    code: string;
  };
  quantity?: number;
}

@Component({
  selector: 'app-cart-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './cart-confirmation-modal.html',
  styleUrl: './cart-confirmation-modal.scss'
})
export class CartConfirmationModal {
  @Input() isOpen = false;
  @Input() item: CartItem | null = null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
