import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Datos } from '../datos';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  memberSince: string;
}

interface OrderItem {
  id?: number | null;
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  description?: string | null;
  dimensions?: {
    width?: string | null;
    height?: string | null;
    depth?: string | null;
  } | null;
  color?: {
    name?: string | null;
    code?: string | null;
  } | null;
  availableColors?: Array<{ nombre?: string; codigo_hex?: string; name?: string; code?: string }> | null;
  includes?: string[];
}

interface Order {
  id: number;
  type: 'pedido' | 'custom';
  name?: string | null;
  description?: string | null;
  date: string;
  createdAt?: string | null;
  status: string;
  statusLabel: string;
  progressStatus?: string | null;
  progressStatusLabel?: string | null;
  items: OrderItem[];
  total: number;
}

interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-profile',
  imports: [Nav, Footer, CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  activeTab: 'credentials' | 'orders' | 'favorites' = 'credentials';
  user: User | null = null;
  originalUser: User | null = null;
  isLoading = true;
  notLogged = false;

  constructor(private router: Router, private datosService: Datos) {}

  logout(): void {
    // Call backend to clear cookie/session
    this.datosService.logout().subscribe({
      next: (res: any) => {
        console.log('Logout response:', res);
      },
      error: (err) => {
        console.warn('Error during logout request:', err);
      },
      complete: () => {
        // Clear client-side stored user data
        try { localStorage.removeItem('loggedUser'); } catch (e) { /* ignore */ }
        this.user = null;
        this.originalUser = null;
        this.notLogged = true;
        this.isLoading = false;
        // Optionally navigate to profile root to refresh UI
        this.router.navigate(['/profile']);
      }
    });
  }

  ngOnInit(): void {
    this.datosService.getLoggedUser().subscribe({
      next: (user: any) => {
        if (user && user.email) {
          this.user = user;
          this.originalUser = { ...user };
          this.isLoading = false;
          // Load real orders for this logged user
          this.fetchOrders(user.email);
        } else {
          this.notLogged = true;
          this.isLoading = false;
        }
      },
      error: () => {
        // Try fallback to localStorage if server-side check fails
        try {
          const stored = localStorage.getItem('loggedUser');
          if (stored) {
            const parsed = JSON.parse(stored);
            // Map backend field names to frontend User interface if needed
            this.user = {
              name: parsed.nombre || parsed.name || '',
              email: parsed.email || '',
              phone: parsed.telefono || parsed.phone || '',
              address: parsed.direccion || parsed.address || '',
              avatar: parsed.avatar || '',
              memberSince: parsed.fecha_registro || parsed.memberSince || ''
            };
            this.originalUser = { ...this.user };
            this.isLoading = false;
            this.notLogged = false;
            if (this.user.email) {
              this.fetchOrders(this.user.email);
            }
            return;
          }
        } catch (e) {
          console.warn('Error leyendo loggedUser desde localStorage:', e);
        }

        this.notLogged = true;
        this.isLoading = false;
      }
    });
  }

  hasChanges(): boolean {
    return !!(this.user && this.originalUser && JSON.stringify(this.user) !== JSON.stringify(this.originalUser));
  }

  saveChanges(): void {
    if (this.user) {
      this.originalUser = { ...this.user };
      console.log('Changes saved:', this.user);
    }
  }

  orders: Order[] = [];

  favorites: FavoriteItem[] = [
    {
      id: 1,
      name: 'Scandinavian Armchair',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300'
    },
    {
      id: 2,
      name: 'Floor Lamp',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300'
    },
    {
      id: 3,
      name: 'Modular Shelving',
      price: 42000,
      image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=300'
    }
  ];

  private fetchOrders(email: string): void {
    if (!email) return;
    this.datosService.getMyOrders(email).subscribe({
      next: (res: any) => {
        this.orders = this.transformOrdersResponse(res);
      },
      error: (err) => {
        console.error('Error loading user orders:', err);
      }
    });
  }

  private transformOrdersResponse(res: any): Order[] {
    const toArray = (raw: any): any[] => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === 'object') return [parsed];
        } catch (e) {
          return [];
        }
      }
      if (typeof raw === 'object') {
        const keys = Object.keys(raw);
        const numericLike = keys.length && keys.every(k => String(Number(k)) === k);
        if (numericLike) return keys.map(k => raw[k]);
        return [raw];
      }
      return [];
    };

    const orders = (res?.orders || []) as any[];
    return orders.map((o: any) => {
      const rawItems = toArray(o.items ?? o.items_json ?? o.itemsData ?? o.items);
      const parsedItems: OrderItem[] = rawItems.map((it: any) => {
        const quantity = Number(it?.quantity ?? it?.qty ?? 1) || 1;
        const price = Number(it?.price ?? it?.unit_price ?? it?.precio ?? 0) || 0;
        const colorSource = it?.color ?? it?.selectedColor ?? null;
        const resolvedColor = colorSource
          ? {
              name: colorSource.name ?? colorSource.nombre ?? null,
              code: colorSource.code ?? colorSource.codigo_hex ?? null
            }
          : null;
        const dims = it?.dimensions;
        const resolvedDimensions = dims
          ? {
              width: dims.width ?? null,
              height: dims.height ?? null,
              depth: dims.depth ?? null
            }
          : null;
        const includes = Array.isArray(it?.includes)
          ? it.includes
          : typeof it?.includes === 'string'
            ? it.includes.split(/[,|]/).map((part: string) => part.trim()).filter(Boolean)
            : [];

        return {
          id: it?.id ?? null,
          name: it?.name || it?.title || 'Product',
          description: it?.description ?? null,
          quantity,
          price,
          image: it?.image ?? it?.imagen ?? null,
          dimensions: resolvedDimensions,
          color: resolvedColor,
          availableColors: it?.availableColors ?? null,
          includes
        };
      });

      const backendTotal = Number(o.total ?? o.totalPrice ?? o.precio_total ?? 0);
      const computedTotal = parsedItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
      const statusRaw = (o.status ?? o.estado ?? 'pending') as string;
      const statusLabel = o.status_label ?? this.getStatusText(statusRaw);
      const createdAt = o.created_at ?? o.fecha ?? null;
      let displayDate = createdAt;
      try {
        displayDate = createdAt ? new Date(createdAt).toLocaleDateString() : new Date().toLocaleDateString();
      } catch (e) {
        displayDate = createdAt || new Date().toLocaleDateString();
      }

      const progressStatus = (o.progress_status ?? null) as string | null;
      const progressStatusLabel = o.progress_status_label ?? null;

      return {
        id: Number(o.id),
        type: o.type === 'custom' ? 'custom' : 'pedido',
        name: o.name ?? null,
        description: o.description ?? null,
        date: displayDate,
        createdAt,
        status: statusRaw,
        statusLabel,
        progressStatus,
        progressStatusLabel,
        items: parsedItems,
        total: backendTotal || computedTotal
      } as Order;
    });
  }

  statusClass(status: string): string {
    if (!status) return '';
    return status.toLowerCase().replace(/[\s_]+/g, '-');
  }

  getStatusText(status: string): string {
    if (!status) return 'Pending';
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'to-do': 'To-do',
      'in progress': 'In Progress',
      'done': 'Completed',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    if (statusMap[status]) return statusMap[status];
    const readable = status.replace(/[-_]/g, ' ');
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  }

  removeFavorite(id: number): void {
    this.favorites = this.favorites.filter(item => item.id !== id);
  }
}
