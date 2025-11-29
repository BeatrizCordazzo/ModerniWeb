import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-furniture-detail-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './furniture-detail-modal.html',
  styleUrls: ['./furniture-detail-modal.scss']
})
export class FurnitureDetailModal implements OnChanges {
  @Input() isOpen = false;
  @Input() title = 'Detalles del proyecto';
  @Input() data: any = null; // presupuesto, proyecto u order
  @Output() cancel = new EventEmitter<void>();

  selectedImageIndex = 0;
  private detalleCache: any = null;
  private detalleSource: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.detalleCache = null;
      this.detalleSource = null;
      this.selectedImageIndex = 0;
    }
  }

  onCancel(): void { this.cancel.emit(); }

  private resolveDetalle(): any | null {
    const source = this.data?.detalle ?? this.data?.detalles ?? null;
    if (!source) return null;
    if (this.detalleSource === source && this.detalleCache) {
      return this.detalleCache;
    }
    let parsed: any = source;
    if (typeof source === 'string') {
      try {
        parsed = JSON.parse(source);
      } catch (e) {
        parsed = null;
      }
    }
    this.detalleSource = source;
    this.detalleCache = parsed && typeof parsed === 'object' ? parsed : null;
    return this.detalleCache;
  }

  // Normalized items array from several possible payload shapes
  getItems(): any[] {
    if (!this.data) return [];
    const detalle = this.resolveDetalle();
    if (Array.isArray(detalle)) return detalle;
    if (detalle) {
      if (Array.isArray(detalle.furniture)) return detalle.furniture;
      if (detalle.furniture && Array.isArray(detalle.furniture.items)) return detalle.furniture.items;
      if (Array.isArray(detalle.items)) return detalle.items;
    }
    if (Array.isArray(this.data.items)) return this.data.items;
    if (Array.isArray(this.data.furniture)) return this.data.furniture;
    // fallback: try to detect any array-valued prop
    for (const k of Object.keys(this.data || {})) {
      if (Array.isArray(this.data[k])) return this.data[k];
    }
    return [];
  }

  // Try multiple keys to get a readable client name
  getClientName(): string {
    if (!this.data) return '-';
    // search top-level and one-level nested objects for a reasonable client name
    const keys = ['cliente_nombre','customer_name','nombre_cliente','nombre','cliente','usuario_nombre','customer','user','customer_info','cliente'];
    const found = this.searchForKey(this.data, keys);
    if (found) return found;
    // as fallback, try to inspect items for a customer object
    if (Array.isArray(this.getItems()) && this.getItems().length) {
      const first = this.getItems()[0];
      const candidate = this.searchForKey(first, ['customer','cliente','user','owner','vendor','customer_name','client']);
      if (candidate) return candidate;
    }
    return '-';
  }

  // Generic helper: search object and one-level nested objects for first matching key/value
  private searchForKey(obj: any, keys: string[]): string | null {
    if (!obj || typeof obj !== 'object') return null;
    for (const k of keys) {
      if (obj[k]) {
        if (typeof obj[k] === 'string' && obj[k].trim()) return obj[k];
        if (typeof obj[k] === 'object') {
          const nested = obj[k].name || obj[k].nombre || obj[k].full_name || obj[k].fullname || obj[k].username || obj[k].email;
          if (nested && typeof nested === 'string') return nested;
        }
      }
    }
    // check one level nested objects
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val && typeof val === 'object') {
        for (const k of keys) {
          if (val[k] && typeof val[k] === 'string' && val[k].trim()) return val[k];
          if (val[k] && typeof val[k] === 'object') {
            const nested = val[k].name || val[k].nombre || val[k].full_name || val[k].fullname || val[k].username || val[k].email;
            if (nested && typeof nested === 'string') return nested;
          }
        }
      }
    }
    return null;
  }

  getOrderId(): string {
    if (!this.data) return '-';
    const raw =
      this.data.id ??
      this.data.pedido_id ??
      this.data.order_id ??
      this.data.presupuesto_id ??
      this.data.proyecto_id ??
      null;
    return raw !== null && raw !== undefined ? raw.toString() : '-';
  }

  getStatus(): string {
    if (!this.data) return '-';
    return this.data.status || this.data.estado || this.data.estado_pedido || this.data.order_status || '-';
  }

  getDate(): string {
    if (!this.data) return '-';
    return this.data.fecha_creacion || this.data.created_at || this.data.fecha || this.data.date || '-';
  }

  getContactInfo(): any {
    if (!this.data) return {};
    // If client is nested object, extract from it
    const clientObj = (typeof this.data.cliente === 'object' && this.data.cliente) || (typeof this.data.customer === 'object' && this.data.customer) || (typeof this.data.user === 'object' && this.data.user) || null;
    const email = this.data.email || this.data.cliente_email || this.data.customer_email || this.data.correo || (clientObj && (clientObj.email || clientObj.correo)) || null;
    const telefono = this.data.telefono || this.data.phone || this.data.telefono_cliente || (clientObj && (clientObj.phone || clientObj.telefono)) || null;
    const direccion = this.data.direccion || this.data.address || this.data.domicilio || (clientObj && (clientObj.address || clientObj.direccion)) || null;
    return { email, telefono, direccion };
  }

  getTitle(): string {
    if (!this.data) return '-';
    return this.data.proyecto_nombre || this.data.titulo || this.data.title || this.data.nombre_pedido || ('Pedido #' + this.getOrderId());
  }

  // Item helpers
  getItemPrice(it: any): string {
    if (!it) return '-';
    if (it.price !== undefined && it.price !== null) return it.price.toString();
    if (it.unit_price !== undefined) return it.unit_price.toString();
    if (it.precio !== undefined) return it.precio.toString();
    return '-';
  }

  getItemExtra(it: any): any {
    if (!it) return null;
    if (it.extra && typeof it.extra === 'string') {
      try { return JSON.parse(it.extra); } catch (e) { return it.extra; }
    }
    return it.extra || it.notes || it.meta || null;
  }

  // Return extra as object if possible, otherwise null
  getItemExtraObject(it: any): any | null {
    const raw = this.getItemExtra(it);
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    // try parse if string looks like JSON
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try { return JSON.parse(trimmed); } catch (e) { return null; }
      }
    }
    return null;
  }

  // Convenience: try to extract common fields from extra
  getItemExtraField(it: any, field: string): any {
    const obj = this.getItemExtraObject(it);
    if (!obj) return null;
    return obj[field] ?? null;
  }

  getImages(): string[] {
    const items = this.getItems();
    const imgs: string[] = [];
    items.forEach((it: any) => {
      if (it.image) imgs.push(it.image);
      if (it.images && Array.isArray(it.images)) imgs.push(...it.images);
      if (it.imagenes && Array.isArray(it.imagenes)) imgs.push(...it.imagenes);
    });
    // also allow top-level images array
    let top = this.data && (this.data.images || this.data.imagenes || this.data.fotos);
    if (!top) {
      const detalle = this.resolveDetalle();
      if (detalle && (detalle.images || detalle.imagenes)) {
        top = detalle.images || detalle.imagenes;
      }
    }
    // if top is a JSON string (from DB), try parse
    if (top && typeof top === 'string') {
      try { top = JSON.parse(top); } catch (e) { /* leave */ }
    }
    if (Array.isArray(top)) imgs.unshift(...top);
    // remove falsy and duplicates
    return imgs.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  }

  // space dimensions helper
  getSpaceDimensions(): any {
    if (!this.data) return null;
    // If numeric columns exist (space_width/height/depth), return as normalized object
    const w = this.data.space_width ?? this.data.spaceWidth ?? this.data['space-width'];
    const h = this.data.space_height ?? this.data.spaceHeight ?? this.data['space-height'];
    const d = this.data.space_depth ?? this.data.spaceDepth ?? this.data['space-depth'];
    if (w !== undefined || h !== undefined || d !== undefined) {
      return { width: w ?? null, height: h ?? null, depth: d ?? null };
    }
    // common keys
    const candidates = ['spaceDimensions','space_dimensions','space_dims','medidas','dimensions','space'];
    // check top-level
    for (const k of candidates) {
      if (this.data[k]) return this.data[k];
    }
    // check detalle/detalles (may be object or JSON string)
    const det = this.resolveDetalle();
    if (det) {
      if (typeof det === 'string') {
        try {
          const parsed = JSON.parse(det);
          if (parsed && (parsed.spaceDimensions || parsed.space_dims || parsed.medidas || parsed.dimensions)) return parsed.spaceDimensions || parsed.space_dims || parsed.medidas || parsed.dimensions || parsed;
        } catch (e) { /* ignore */ }
      } else if (typeof det === 'object') {
        for (const k of candidates) {
          if (det[k]) return det[k];
        }
      }
    }
    // finally try to derive from items extras
    const items = this.getItems();
    if (items && items.length) {
      for (const it of items) {
        const eo = this.getItemExtraObject(it);
        if (eo && (eo.dimensions || eo.spaceDimensions || eo.medidas)) return eo.dimensions || eo.spaceDimensions || eo.medidas;
      }
    }
    return null;
  }

  // Returns a human-friendly dimensions string for an item, or null
  getItemDimensionsString(it: any): string | null {
    if (!it) return null;
    const dims = it.dimensions || this.getItemExtraField(it, 'dimensions') || this.getItemExtraField(it, 'dimensiones') || null;
    if (dims && typeof dims === 'object') {
      const w = dims.width || dims.w || dims.ancho || dims.x || null;
      const h = dims.height || dims.h || dims.alto || dims.y || null;
      const d = dims.depth || dims.d || dims.profundidad || null;
      const parts = [];
      if (w) parts.push(w);
      if (h) parts.push(h);
      if (d) parts.push(d);
      if (parts.length) return parts.join(' × ') + ' cm';
    }
    // fallback: direct width/height fields
    const w = it.width || it.w || this.getItemExtraField(it, 'width');
    const h = it.height || it.h || this.getItemExtraField(it, 'height');
    if (w || h) return `${w || '-'} × ${h || '-'} cm`;
    return null;
  }

  // budget helper
  getBudget(): any {
    return this.data && (this.data.total || this.data.totalPrice || this.data.presupuesto_aprox || this.data.total_presupuesto || this.data.total_presupuesto || this.data.presupuesto || null);
  }
}
