import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price-modal.html',
  styleUrls: ['./price-modal.scss']
})
export class PriceModal {
  @Input() isOpen = false;
  @Input() title = 'Aceptar presupuesto';
  @Input() presupuesto: any = null;
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();
  @Output() invalid = new EventEmitter<string>();

  finalPrice: number | null = null;

  onConfirm(): void {
    const p = Number(this.finalPrice || 0);
    if (!p || p <= 0) {
      this.invalid.emit('Por favor ingresa el precio final antes de aceptar');
      return;
    }
    this.confirm.emit(p);
  }

  onCancel(): void { this.cancel.emit(); }
}
