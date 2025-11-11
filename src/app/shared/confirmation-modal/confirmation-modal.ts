import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-confirmation-modal',
  imports: [],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss'
})
export class ConfirmationModal {
  @Input() isOpen = false;
  @Input() title = 'Confirmar';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void { this.confirm.emit(); }
  onCancel(): void { this.cancel.emit(); }
}
