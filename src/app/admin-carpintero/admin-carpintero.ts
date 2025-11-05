import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Datos } from '../datos';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { RejectionModal } from '../shared/rejection-modal/rejection-modal';
import { ConfirmationModal } from '../shared/confirmation-modal/confirmation-modal';
import { PriceModal } from '../shared/price-modal/price-modal.component';
import { FurnitureDetailModal } from '../shared/furniture-detail-modal/furniture-detail-modal';
import { ToastNotification } from '../shared/toast-notification/toast-notification';

@Component({
  selector: 'app-admin-carpintero',
  standalone: true,
  imports: [Nav, Footer, CommonModule, FormsModule, RejectionModal, ConfirmationModal, ToastNotification, MatTabsModule, PriceModal, FurnitureDetailModal],
  templateUrl: './admin-carpintero.html',
  styleUrls: ['./admin-carpintero.scss']
})
export class AdminCarpintero implements OnInit {
  pendingPresupuestos: any[] = [];
  todoProjects: any[] = [];
  showTodo = false;
  // UI tabs: 'pendientes', 'todo' or 'aceptados'
  activeTab: 'pendientes' | 'todo' | 'aceptados' = 'pendientes';

  acceptedProjects: any[] = [];
  // Orders (pedidos) for admin
  orders: any[] = [];

  // Rejection modal state
  showRejectionModal = false;
  rejectionTargetId: number | null = null;
  rejectionMotivo = '';

  // Price modal state
  showPriceModal = false;
  priceModalPresupuesto: any = null;

  // Detail modal state (images, medidas, presupuesto aproximado)
  showDetailModal = false;
  detailModalData: any = null;

  // Confirmation modal state
  showConfirmModal = false;
  confirmMessage = '';
  confirmAction: string | null = null;
  confirmTargetId: number | null = null;
  // For status-change confirmations (not used; status changes are saved on 'Guardar')

  // Toast notifications
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'success';
  toastDuration = 3000;

  userRole = '';


  constructor(private datos: Datos, private router: Router) {}

  ngOnInit(): void {
    // Ensure only admin can access this page
    this.datos.getLoggedUser().subscribe({
      next: (user: any) => {
        if (!user || user.rol !== 'admin') {
          this.router.navigate(['/error']);
          return;
        }
        this.userRole = user.rol;
        this.loadPending();
      },
      error: () => {
        // fallback: check localStorage
        try {
          const stored = localStorage.getItem('loggedUser');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.rol !== 'admin') {
              this.router.navigate(['/error']);
              return;
            }
            this.userRole = parsed.rol;
            this.loadPending();
            return;
          }
        } catch (e) {}
        this.router.navigate(['/error']);
      }
    });
  }

  loadPending(): void {
    this.datos.getPendingPresupuestos().subscribe({
      next: (res: any) => {
        this.pendingPresupuestos = res.presupuestos || [];
      },
      error: (err) => console.error('Error loading presupuestos', err)
    });
  }

  accept(presupuestoId: number): void {
    // Open price modal so carpintero can input final price before accepting
    const p = this.pendingPresupuestos.find(pp => pp.presupuesto_id === presupuestoId) || null;
    this.priceModalPresupuesto = p;
    this.showPriceModal = true;
  }

  openReject(presupuestoId: number): void {
    this.rejectionTargetId = presupuestoId;
    this.rejectionMotivo = '';
    this.showRejectionModal = true;
  }

  closeModal(): void {
    this.showRejectionModal = false;
    this.rejectionTargetId = null;
    this.rejectionMotivo = '';
  }

  sendReject(): void {
    if (!this.rejectionTargetId) return;
    if (!this.rejectionMotivo.trim()) {
      this.showToast('Por favor escribir el motivo del rechazo', 'warning');
      return;
    }
    this.datos.rejectPresupuesto(this.rejectionTargetId, this.rejectionMotivo).subscribe({
      next: (res: any) => {
        this.closeModal();
        this.loadPending();
        this.showToast('Presupuesto rechazado y cliente notificado', 'success');
      },
      error: (err) => {
        this.showToast('Error rechazando presupuesto', 'error');
      }
    });
  }

  toggleTodo(): void {
    // deprecated: keep for compatibility
    this.showTodo = !this.showTodo;
    if (this.showTodo) this.loadTodoList();
  }

  loadTodoList(): void {
    this.datos.getTodoList().subscribe({
      next: (res: any) => {
        this.todoProjects = res.projects || [];
      },
      error: (err) => console.error('Error loading todo list', err)
    });
  }

  // Load accepted projects (use the same endpoint; filter client-side by presence of carpintero_estado)
  loadAcceptedProjects(): void {
    this.datos.getTodoList().subscribe({
      next: (res: any) => {
        const projects = res.projects || [];
        // accepted projects are those that were assigned to carpintero (carpintero_estado not null)
        this.acceptedProjects = projects.filter((p: any) => p.carpintero_estado !== null);
      },
      error: (err) => console.error('Error loading accepted projects', err)
    });
  }

  // Load non-custom orders (pedidos) for admin
  loadOrders(): void {
    this.datos.getOrders().subscribe({
      next: (res: any) => {
        const raw = res.orders || [];
        // Ensure items are arrays (backend may return JSON-encoded strings)
        this.orders = raw.map((o: any) => {
          let items = o.items || [];
          if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch (e) { items = []; }
          }
          return { ...o, items };
        });
      },
      error: (err) => console.error('Error loading orders', err)
    });
  }

  // Getters to split orders into columns similar to projects
  get orderTodoList(): any[] {
    return this.orders.filter(o => {
      const s = (o.estado || o.status || '').toString().toLowerCase();
      return s === 'pendiente' || s === 'to-do' || s === 'todo' || s === '';
    });
  }

  get orderInProgressList(): any[] {
    return this.orders.filter(o => {
      const s = (o.estado || o.status || '').toString().toLowerCase();
      return s.includes('in progress') || s === 'inprogress' || s.includes('progreso') || s.includes('proceso');
    });
  }

  get orderDoneList(): any[] {
    return this.orders.filter(o => {
      const s = (o.estado || o.status || '').toString().toLowerCase();
      return s === 'done' || s === 'finalizado' || s === 'done' || s.includes('done');
    });
  }

  // Called when admin switches tabs (index 0 = pendientes, 1 = todo, 2 = pedidos)
  onTabChange(index: number): void {
    if (index === 0) this.loadPending();
    else if (index === 1) this.loadAcceptedProjects();
    else if (index === 2) this.loadOrders();
  }

  // Grouped getters for To-Do columns
  get todoProjectsList(): any[] {
    return this.acceptedProjects.filter(p => (p.carpintero_estado || '').toLowerCase() === 'to-do' || (p.carpintero_estado || '').toLowerCase() === 'todo');
  }

  get inProgressProjectsList(): any[] {
    return this.acceptedProjects.filter(p => (p.carpintero_estado || '').toLowerCase() === 'in progress' || (p.carpintero_estado || '').toLowerCase() === 'inprogress');
  }

  get doneProjectsList(): any[] {
    return this.acceptedProjects.filter(p => (p.carpintero_estado || '').toLowerCase() === 'done');
  }

  // Save a single project's estado
  saveProject(proj: any): void {
    if (!proj || !proj.proyecto_id) return;
    const newStatus = proj.pendingEstado ?? proj.carpintero_estado;
    if ((proj.carpintero_estado || '').toLowerCase() === (newStatus || '').toLowerCase()) {
      // nothing to do
      delete proj.pendingEstado;
      this.showToast('No hay cambios para guardar', 'info');
      return;
    }
    this.datos.updateProjectProgress(proj.proyecto_id, newStatus).subscribe({
      next: () => {
        proj.carpintero_estado = newStatus;
        delete proj.pendingEstado;
        this.showToast('Estado actualizado', 'success');
        // refresh lists to move project between columns
        this.loadAcceptedProjects();
      },
      error: () => this.showToast('Error guardando estado', 'error')
    });
  }

  // Save order status (local update; backend endpoint can be added later)
  saveOrderStatus(order: any): void {
    if (!order || !order.id) return;
    const newStatus = order.pendingEstado ?? order.estado;
    if ((order.estado || '').toString().toLowerCase() === (newStatus || '').toString().toLowerCase()) {
      delete order.pendingEstado;
      this.showToast('No hay cambios para guardar', 'info');
      return;
    }
    // Persist the order status via API
    const id = order.id || order.pedido_id;
    this.datos.updateOrderStatus(id, newStatus).subscribe({
      next: (res: any) => {
        order.estado = newStatus;
        delete order.pendingEstado;
        this.showToast('Estado del pedido guardado', 'success');
        // refresh orders so item moves between columns if needed
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error saving order status', err);
        this.showToast('Error guardando estado del pedido', 'error');
      }
    });
  }

  // Request confirmation before saving a single project
  requestSaveProject(proj: any): void {
    if (!proj || !proj.proyecto_id) return;
    this.confirmMessage = '¿Deseas guardar los cambios en este proyecto?';
    this.confirmAction = 'saveProject';
    this.confirmTargetId = proj.proyecto_id;
    this.showConfirmModal = true;
  }

  // Set a pending status on a project when user selects a new value; don't persist until Save
  setPendingStatus(proj: any, value: string): void {
    if (!proj) return;
    const current = (proj.carpintero_estado || '').toString();
    if (!value || value.toString().toLowerCase() === current.toLowerCase()) {
      // selection equals current state: clear pending
      delete proj.pendingEstado;
      return;
    }
    proj.pendingEstado = value;
  }

  // Request confirmation before saving all accepted projects
  requestSaveAll(): void {
    if (!this.acceptedProjects || this.acceptedProjects.length === 0) {
      this.showToast('No hay proyectos para guardar', 'info');
      return;
    }
    this.confirmMessage = '¿Deseas guardar los cambios en todos los proyectos aceptados?';
    this.confirmAction = 'saveAllAccepted';
    this.confirmTargetId = null;
    this.showConfirmModal = true;
  }

  // Save all accepted projects at once
  saveAllAccepted(): void {
    const saves = this.acceptedProjects.map(p => {
      return new Promise<void>((resolve) => {
        const newStatus = p.pendingEstado ?? p.carpintero_estado;
        if ((p.carpintero_estado || '').toLowerCase() === (newStatus || '').toLowerCase()) {
          // no change, resolve immediately
          delete p.pendingEstado;
          resolve();
          return;
        }
        this.datos.updateProjectProgress(p.proyecto_id, newStatus).subscribe({
          next: () => {
            p.carpintero_estado = newStatus;
            delete p.pendingEstado;
            resolve();
          },
          error: () => { resolve(); }
        });
      });
    });
    Promise.all(saves).then(() => { this.loadAcceptedProjects(); this.showToast('Todos los cambios guardados', 'success'); });
  }

  updateProgress(proyectoId: number, estado: string): void {
    this.datos.updateProjectProgress(proyectoId, estado).subscribe({
      next: () => this.loadTodoList(),
      error: (err) => this.showToast('Error actualizando progreso', 'error')
    });
  }

  // Confirmation modal handlers
  onConfirmModalConfirm(): void {
    const action = this.confirmAction;
    const target = this.confirmTargetId;
    this.showConfirmModal = false;
    this.confirmAction = null;
    this.confirmTargetId = null;

    if (action === 'acceptPresupuesto' && target) {
      this.datos.acceptPresupuesto(target).subscribe({
        next: () => {
          this.loadPending();
          this.showToast('Presupuesto aceptado', 'success');
        },
        error: () => this.showToast('Error aceptando presupuesto', 'error')
      });
    }
    else if (action === 'saveProject' && target) {
      // find the project in acceptedProjects and save it
      const proj = this.acceptedProjects.find((p: any) => p.proyecto_id === target);
      if (proj) {
        this.saveProject(proj);
      } else {
        // fallback: directly call API if projecto not in list
        this.datos.updateProjectProgress(target, 'to-do').subscribe({
          next: () => this.showToast('Estado actualizado', 'success'),
          error: () => this.showToast('Error guardando estado', 'error')
        });
      }
    }
    else if (action === 'saveAllAccepted') {
      this.saveAllAccepted();
    }
  }

  onConfirmModalCancel(): void {
    this.showConfirmModal = false;
    this.confirmAction = null;
    this.confirmTargetId = null;
  }

  // Price modal handlers
  onPriceModalConfirm(finalPrice: number): void {
    if (!this.priceModalPresupuesto || !this.priceModalPresupuesto.presupuesto_id) return;
    const id = this.priceModalPresupuesto.presupuesto_id;
    this.showPriceModal = false;
    this.priceModalPresupuesto = null;
    this.datos.acceptPresupuesto(id, finalPrice).subscribe({
      next: () => {
        this.loadPending();
        this.showToast('Presupuesto aceptado y precio enviado al cliente', 'success');
      },
      error: () => this.showToast('Error aceptando presupuesto', 'error')
    });
  }

  onPriceModalCancel(): void {
    this.showPriceModal = false;
    this.priceModalPresupuesto = null;
  }

  // Details modal
  openDetails(data: any): void {
    if (!data) {
      this.detailModalData = null;
      this.showDetailModal = true;
      return;
    }
    // If a full project object was passed (from To-Do), prefer its active_presupuesto if present
    if (data.active_presupuesto) {
      // merge some project-level metadata (cliente_nombre, proyecto_nombre) into the presupuesto object
      const ap = { ...data.active_presupuesto };
      if (!ap.cliente_nombre && data.cliente_nombre) ap.cliente_nombre = data.cliente_nombre;
      if (!ap.proyecto_nombre && data.proyecto_nombre) ap.proyecto_nombre = data.proyecto_nombre;
      // also attach project description if available
      if (!ap.proyecto && data.proyecto_nombre) ap.proyecto = data.proyecto_nombre;
      this.detailModalData = ap;
    } else if (data.presupuestos && Array.isArray(data.presupuestos) && data.presupuestos.length === 1) {
      // sometimes a single-presupuesto object is wrapped as project; prefer that presupuesto
      this.detailModalData = data.presupuestos[0];
    } else {
      // fallback: pass through what's given (presupuesto row, order, etc.)
      this.detailModalData = data;
    }
    this.showDetailModal = true;
  }

  closeDetails(): void {
    this.showDetailModal = false;
    this.detailModalData = null;
  }

  // Note: status selection updates locally; confirmation happens on 'Guardar' to persist changes.

  // Toast helper
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration = 3000): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastDuration = duration;
    this.toastVisible = true;
    // Auto hide after duration + small buffer
    setTimeout(() => { this.toastVisible = false; }, duration + 400);
  }

}
