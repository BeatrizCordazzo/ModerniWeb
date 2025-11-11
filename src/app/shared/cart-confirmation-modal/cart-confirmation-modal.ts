import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

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
  imports: [FormsModule],
  templateUrl: './cart-confirmation-modal.html',
  styleUrl: './cart-confirmation-modal.scss'
})
export class CartConfirmationModal {
  @Input() isOpen = false;
  @Input() item: CartItem | null = null;
  // optional product id passed from parent so modal can perform direct updates when needed
  @Input() productId?: number | null = null;
  @Input() adminMode = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  // small confirmation when admin presses Save
  showSaveConfirm = false;

  // editable copy used when adminMode is enabled
  editItem: any = null;
  private colorCanvasCtx: CanvasRenderingContext2D | null = null;
  private readonly colorAliases: Record<string, string> = {
    'blanco': '#ffffff',
    'negro': '#000000',
    'rojo': '#ff0000',
    'azul': '#0000ff',
    'verde': '#008000',
    'amarillo': '#ffff00',
    'gris': '#808080',
    'marron': '#8b4513',
    'cafe': '#8b4513',
    'marron oscuro': '#5a381e',
    'rosa': '#ffc0cb',
    'naranja': '#ffa500',
    'morado': '#800080',
    'violeta': '#8a2be2',
    'turquesa': '#40e0d0'
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item']) {
      // clone item for safe editing
      this.editItem = this.item ? JSON.parse(JSON.stringify(this.item)) : null;
      // Ensure nested objects exist to avoid template binding errors
      if (this.editItem) {
        if (!this.editItem.selectedColor) {
          this.editItem.selectedColor = { name: '', code: '' };
        }
        if (!this.editItem.dimensions) {
          this.editItem.dimensions = { width: '', height: '', depth: '' };
        } else {
          // ensure all dimension keys exist
          this.editItem.dimensions.width = this.editItem.dimensions.width ?? '';
          this.editItem.dimensions.height = this.editItem.dimensions.height ?? '';
          this.editItem.dimensions.depth = this.editItem.dimensions.depth ?? '';
        }
      }
    }
    if (changes['isOpen'] && !this.isOpen) {
      // reset edit copy when modal closes
      this.editItem = this.item ? JSON.parse(JSON.stringify(this.item)) : null;
      if (this.editItem) {
        if (!this.editItem.selectedColor) this.editItem.selectedColor = { name: '', code: '' };
        if (!this.editItem.dimensions) this.editItem.dimensions = { width: '', height: '', depth: '' };
      }
    }
  }

  constructor(private http: HttpClient) {}

  onConfirm(): void {
    this.confirm.emit();
  }

  onSave(): void {
    // show a secondary confirmation step for admin saves
    console.log('CartConfirmationModal.onSave: admin requested save, showing confirm overlay');
    this.showSaveConfirm = true;
  }

  confirmSave(): void {
    // actually emit save and close the confirmation
    console.log('CartConfirmationModal.confirmSave: emitting save with', this.editItem);
    this.save.emit(this.editItem);

    // Also attempt to persist directly from the modal if we have a product id
    const id = this.productId ?? (this.editItem && (this.editItem as any).id);
    if (id) {
      const payload: any = {
        id: id,
        name: this.editItem.name,
        price: this.editItem.price,
        image: this.editItem.image,
        dimensions: this.editItem.dimensions || null
      };
      console.log('CartConfirmationModal.confirmSave: sending direct fetch to update_product.php with', payload);
      // Use fetch directly to ensure credentials are included even if HttpClient config differs
      fetch('http://localhost/moderni/update_product.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json()).then(j => {
        console.log('CartConfirmationModal: update_product response', j);
      }).catch(err => {
        console.error('CartConfirmationModal: update_product fetch error', err);
      });
    } else {
      console.warn('CartConfirmationModal.confirmSave: no product id available, skipping direct update');
    }

    this.showSaveConfirm = false;
  }

  cancelSave(): void {
    this.showSaveConfirm = false;
  }

  onColorNameChange(newName: string): void {
    if (!this.editItem || !this.editItem.selectedColor) return;
    const resolved = this.resolveColorCode(newName);
    if (resolved) {
      this.editItem.selectedColor.code = resolved;
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  private resolveColorCode(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const directHex = this.asHex(trimmed);
    if (directHex) return directHex;

    const aliasHex = this.colorAliases[trimmed.toLowerCase()];
    if (aliasHex) return aliasHex;

    if (typeof document === 'undefined') return null;
    const ctx = this.ensureCanvasContext();
    if (!ctx) return null;

    const lower = trimmed.toLowerCase();
    // Save previous color to avoid side effects
    const previous = ctx.fillStyle;
    ctx.fillStyle = '#000000';
    ctx.fillStyle = trimmed;
    const computed = ctx.fillStyle;
    ctx.fillStyle = previous;

    if (computed === '#000000') {
      if (lower === 'black') return '#000000';
      return null;
    }

    if (computed.startsWith('#')) {
      return computed;
    }
    if (computed.startsWith('rgb')) {
      return computed;
    }
    return null;
  }

  private ensureCanvasContext(): CanvasRenderingContext2D | null {
    if (this.colorCanvasCtx) return this.colorCanvasCtx;
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.colorCanvasCtx = canvas ? canvas.getContext('2d') : null;
    return this.colorCanvasCtx;
  }

  private asHex(input: string): string | null {
    const hexRegex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const match = input.match(hexRegex);
    if (!match) return null;
    let hex = match[1];
    if (hex.length === 3) {
      hex = hex.split('').map(ch => ch + ch).join('');
    }
    return `#${hex.toLowerCase()}`;
  }
}
