import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-order-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './custom-order-confirmation-modal.html',
  styleUrl: './custom-order-confirmation-modal.scss'
})
export class CustomOrderConfirmationModal {
  @Input() isOpen = false;
  @Input() order: any | null = null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onCancel();
  }
}
