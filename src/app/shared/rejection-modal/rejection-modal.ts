import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rejection-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './rejection-modal.html',
  styleUrl: './rejection-modal.scss'
})
export class RejectionModal {
  @Input() isOpen = false;
  @Input() motivo = '';
  @Output() motivoChange = new EventEmitter<string>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void { this.confirm.emit(); }
  onCancel(): void { this.cancel.emit(); }
}
