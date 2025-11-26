import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import {
  ArchitectProject,
  ContactMessage,
  ManagedUser,
  ManagedUserPayload,
  SketchupProject,
} from '../datos';

type ManagedUserRole = 'cliente' | 'arquitecto';
interface UserFormModel {
  nombre: string;
  email: string;
  telefono: string;
  rol: ManagedUserRole;
  password: string;
}

@Component({
  selector: 'app-admin-carpintero',
  standalone: true,
  imports: [
    Nav,
    Footer,
    CommonModule,
    FormsModule,
    RejectionModal,
    ConfirmationModal,
    ToastNotification,
    MatTabsModule,
    PriceModal,
    FurnitureDetailModal,
  ],
  templateUrl: './admin-carpintero.html',
  styleUrls: ['./admin-carpintero.scss'],
})
export class AdminCarpintero implements OnInit {
  pendingPresupuestos: any[] = [];
  todoProjects: any[] = [];
  showTodo = false;
  // UI tabs:
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

  contactMessages: Array<ContactMessage & { pendingResponse?: string }> = [];
  messagesLoading = false;
  messagesError = '';
  unreadMessageCount = 0;

  managedUsers: ManagedUser[] = [];
  managedUsersLoading = false;
  managedUsersError = '';
  managedUsersSearch = '';
  editingUserId: number | null = null;
  savingUser = false;
  createUserForm: UserFormModel = this.createEmptyUserForm();
  editUserForm: UserFormModel = this.createEmptyUserForm();
  showUserModal = false;

  architectProjectsPending: ArchitectProject[] = [];
  architectProjectsAccepted: ArchitectProject[] = [];
  architectPendingLoading = false;
  architectAcceptedLoading = false;
  architectPendingError = '';
  architectAcceptedError = '';
  architectDecisionComments: Record<number, string> = {};
  architectDecisionSaving: Record<number, boolean> = {};

  // SketchUp models
  sketchupProjects: SketchupProject[] = [];
  sketchupLoading = false;
  sketchupError = '';
  sketchupFile: File | null = null;
  sketchupTitle = '';
  sketchupNotes = '';
  sketchupEmbedCode = '';
  sketchupUploading = false;
  sketchupViewerUrl: SafeResourceUrl | null = null;
  sketchupSelectedName: string | null = null;
  sketchupViewerProjectId: number | null = null;
  sketchupDeleting: Record<number, boolean> = {};

  constructor(private datos: Datos, private router: Router, private sanitizer: DomSanitizer) {}

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
        this.loadMessages();
        this.loadManagedUsers();
        this.loadArchitectProjects('pending');
        this.loadArchitectProjects('accepted');
        this.loadSketchupProjects();
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
            this.loadMessages();
            this.loadManagedUsers();
            this.loadArchitectProjects('pending');
            this.loadArchitectProjects('accepted');
            this.loadSketchupProjects();
            return;
          }
        } catch (e) {}
        this.router.navigate(['/error']);
      },
    });
  }

  loadPending(): void {
    this.datos.getPendingPresupuestos().subscribe({
      next: (res: any) => {
        this.pendingPresupuestos = res.presupuestos || [];
      },
      error: (err) => console.error('Error loading presupuestos', err),
    });
  }

  accept(presupuestoId: number): void {
    // Open price modal so carpintero can input final price before accepting
    const p = this.pendingPresupuestos.find((pp) => pp.presupuesto_id === presupuestoId) || null;
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
      },
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
      error: (err) => console.error('Error loading todo list', err),
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
      error: (err) => console.error('Error loading accepted projects', err),
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
            try {
              items = JSON.parse(items);
            } catch (e) {
              items = [];
            }
          }
          return { ...o, items };
        });
      },
      error: (err) => console.error('Error loading orders', err),
    });
  }

  loadManagedUsers(): void {
    this.managedUsersLoading = true;
    this.managedUsersError = '';
    this.datos.getManagedUsers().subscribe({
      next: (users) => {
        this.managedUsers = users ?? [];
        this.managedUsersLoading = false;
      },
      error: (err) => {
        console.error('Error loading managed users', err);
        this.managedUsersError = 'No se pudieron cargar los usuarios.';
        this.managedUsersLoading = false;
      },
    });
  }

  loadArchitectProjects(status: 'pending' | 'accepted' = 'pending'): void {
    const isPending = status === 'pending';
    if (isPending) {
      this.architectPendingLoading = true;
      this.architectPendingError = '';
    } else {
      this.architectAcceptedLoading = true;
      this.architectAcceptedError = '';
    }
    this.datos.getArchitectProjects(status).subscribe({
      next: (projects) => {
        if (isPending) {
          this.architectProjectsPending = projects ?? [];
          this.architectPendingLoading = false;
        } else {
          this.architectProjectsAccepted = projects ?? [];
          this.architectAcceptedLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading architect projects', err);
        if (isPending) {
          this.architectPendingError = 'No se pudieron cargar los proyectos de arquitecto.';
          this.architectPendingLoading = false;
        } else {
          this.architectAcceptedError = 'No se pudieron cargar los aceptados.';
          this.architectAcceptedLoading = false;
        }
      },
    });
  }

  decideArchitectProject(project: ArchitectProject, decision: 'accepted' | 'rejected'): void {
    if (!project || !project.id || this.architectDecisionSaving[project.id]) {
      return;
    }
    this.architectDecisionSaving[project.id] = true;
    const comment = (this.architectDecisionComments[project.id] || '').trim();
    this.datos.updateArchitectProjectStatus(project.id, decision, comment).subscribe({
      next: () => {
        this.showToast(
          decision === 'accepted' ? 'Proyecto aceptado' : 'Proyecto rechazado',
          'success'
        );
        delete this.architectDecisionSaving[project.id];
        delete this.architectDecisionComments[project.id];
        this.loadArchitectProjects('pending');
        this.loadArchitectProjects('accepted');
      },
      error: (err) => {
        console.error('Error updating architect project', err);
        this.showToast('No se pudo actualizar el proyecto.', 'error');
        delete this.architectDecisionSaving[project.id];
      },
    });
  }

  getArchitectProjectFileUrl(project: ArchitectProject): string {
    if (!project?.file_url) {
      return '';
    }
    if (project.file_url.startsWith('http')) {
      return project.file_url;
    }
    const base = this.datos.url.endsWith('/') ? this.datos.url : this.datos.url + '/';
    const relative = project.file_url.startsWith('/')
      ? project.file_url.substring(1)
      : project.file_url;
    return base + relative;
  }

  loadSketchupProjects(): void {
    this.sketchupLoading = true;
    this.sketchupError = '';
    this.datos.getSketchupProjects().subscribe({
      next: (projects) => {
        this.sketchupProjects = projects ?? [];
        this.sketchupLoading = false;
      },
      error: (err) => {
        console.error('Error loading SketchUp projects', err);
        this.sketchupError = 'No se pudieron cargar los modelos.';
        this.sketchupLoading = false;
      },
    });
  }

  onSketchupFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files && input.files.length ? input.files[0] : null;
    if (!file) {
      this.sketchupFile = null;
      return;
    }
    if (!file.name.toLowerCase().endsWith('.skp')) {
      this.sketchupError = 'Solo se permiten archivos .skp.';
      this.sketchupFile = null;
      return;
    }
    this.sketchupError = '';
    this.sketchupFile = file;
  }

  uploadSketchupModel(): void {
    if (!this.sketchupFile) {
      this.sketchupError = 'Selecciona un archivo .skp para subir.';
      return;
    }
    this.sketchupUploading = true;
    this.sketchupError = '';
    const embedUrl = this.sketchupEmbedCode?.trim();
    this.datos
      .uploadSketchupProject({
        file: this.sketchupFile,
        title: this.sketchupTitle,
        notes: this.sketchupNotes,
        embedUrl: embedUrl || undefined,
      })
      .subscribe({
        next: (project) => {
          if (project && project.id) {
            this.sketchupProjects = [project, ...this.sketchupProjects];
            this.openSketchupViewer(project);
            this.sketchupTitle = '';
            this.sketchupNotes = '';
            this.sketchupEmbedCode = '';
            this.sketchupFile = null;
            this.showToast('Modelo SketchUp subido', 'success');
          } else {
            this.sketchupError = 'No se pudo registrar el modelo.';
          }
          this.sketchupUploading = false;
        },
        error: (err) => {
          console.error('Error uploading SketchUp model', err);
          const msg = err?.error?.error || 'No se pudo subir el modelo.';
          this.sketchupError = msg;
          this.sketchupUploading = false;
        },
      });
  }

  getSketchupFileUrl(project: SketchupProject): string {
    if (!project?.file_url) {
      return '';
    }
    if (project.file_url.startsWith('http')) {
      return project.file_url;
    }
    const base = this.datos.url.endsWith('/') ? this.datos.url : this.datos.url + '/';
    const relative = project.file_url.startsWith('/')
      ? project.file_url.substring(1)
      : project.file_url;
    return base + relative;
  }

  openSketchupViewer(project: SketchupProject): void {
    const embedUrl = this.extractEmbedUrl(project?.embed_url);
    if (!embedUrl) {
      this.sketchupViewerUrl = null;
      this.sketchupSelectedName = null;
      this.sketchupViewerProjectId = null;
      this.sketchupError = 'Agrega el iframe de 3D Warehouse para este modelo.';
      return;
    }
    this.sketchupError = '';
    this.sketchupViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.sketchupSelectedName =
      project.title || project.file_original_name || `Modelo #${project.id}`;
    this.sketchupViewerProjectId = project?.id ?? null;
  }

  confirmDeleteSketchup(project: SketchupProject): void {
    if (!project || !project.id) return;
    const name = project.title || project.file_original_name || `Modelo #${project.id}`;
    this.confirmMessage = `¿Deseas excluir "${name}"?`;
    this.confirmAction = 'deleteSketchupProject';
    this.confirmTargetId = project.id;
    this.showConfirmModal = true;
  }

  deleteSketchupProject(projectId: number): void {
    if (!projectId) return;
    this.sketchupDeleting[projectId] = true;
    this.datos.deleteSketchupProject(projectId).subscribe({
      next: () => {
        delete this.sketchupDeleting[projectId];
        this.sketchupProjects = this.sketchupProjects.filter((proj) => proj.id !== projectId);
        if (this.sketchupViewerProjectId === projectId) {
          this.sketchupViewerProjectId = null;
          this.sketchupViewerUrl = null;
          this.sketchupSelectedName = null;
        }
        this.showToast('Modelo excluido', 'success');
      },
      error: (err) => {
        console.error('Error deleting SketchUp project', err);
        delete this.sketchupDeleting[projectId];
        const msg = err?.error?.error || 'No se pudo excluir el modelo.';
        this.showToast(msg, 'error');
      },
    });
  }

  private extractEmbedUrl(raw?: string | null): string | null {
    if (!raw) {
      return null;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.toLowerCase().includes('<iframe')) {
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      return null;
    }
    return trimmed;
  }

  refreshManagedUsers(): void {
    this.loadManagedUsers();
  }

  get filteredManagedUsers(): ManagedUser[] {
    const search = this.managedUsersSearch.trim().toLowerCase();
    if (!search) return this.managedUsers;
    return this.managedUsers.filter((user) => {
      const nombre = (user.nombre || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const telefono = (user.telefono || '').toLowerCase();
      const rol = (user.rol || '').toLowerCase();
      return (
        nombre.includes(search) ||
        email.includes(search) ||
        telefono.includes(search) ||
        rol.includes(search)
      );
    });
  }

  startCreateUser(): void {
    this.editingUserId = null;
    this.createUserForm = this.createEmptyUserForm();
  }

  openEditUserModal(user: ManagedUser): void {
    if (!user) return;
    this.editingUserId = user.id;
    this.editUserForm = {
      nombre: user.nombre || '',
      email: user.email || '',
      telefono: user.telefono || '',
      rol: (user.rol as ManagedUserRole) || 'cliente',
      password: '',
    };
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUserId = null;
    this.editUserForm = this.createEmptyUserForm();
  }

  submitUserForm(): void {
    const form = this.createUserForm;
    if (!form.nombre.trim() || !form.email.trim()) {
      this.showToast('Nombre y email son obligatorios', 'warning');
      return;
    }
    const passwordValue = form.password.trim();
    if (passwordValue.length < 4) {
      this.showToast('Ingresa una contrasena de al menos 4 caracteres', 'warning');
      return;
    }

    const payload: ManagedUserPayload & {
      nombre: string;
      email: string;
      rol: ManagedUserRole;
      password: string;
    } = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      rol: form.rol,
      telefono: form.telefono.trim() ? form.telefono.trim() : null,
      password: passwordValue,
    };

    this.savingUser = true;
    this.datos.createManagedUser(payload).subscribe({
      next: () => {
        this.showToast('Usuario creado', 'success');
        this.savingUser = false;
        this.startCreateUser();
        this.loadManagedUsers();
      },
      error: (err: any) => {
        console.error('Error guardando usuario', err);
        const message = err?.error?.error || 'No se pudo crear el usuario';
        this.showToast(message, 'error');
        this.savingUser = false;
      },
    });
  }

  submitEditUserForm(): void {
    if (!this.editingUserId) {
      this.showToast('Selecciona un usuario para modificar', 'warning');
      return;
    }
    const form = this.editUserForm;
    if (!form.nombre.trim() || !form.email.trim()) {
      this.showToast('Nombre y email son obligatorios', 'warning');
      return;
    }
    const passwordValue = form.password.trim();
    if (passwordValue && passwordValue.length < 4) {
      this.showToast('La contrasena debe tener al menos 4 caracteres', 'warning');
      return;
    }

    const payload: ManagedUserPayload = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim() ? form.telefono.trim() : null,
      rol: form.rol,
    };
    if (passwordValue) {
      payload.password = passwordValue;
    }

    this.savingUser = true;
    this.datos.updateManagedUser(this.editingUserId, payload).subscribe({
      next: () => {
        this.showToast('Usuario modificado', 'success');
        this.savingUser = false;
        this.closeUserModal();
        this.loadManagedUsers();
      },
      error: (err) => {
        console.error('Error guardando usuario', err);
        const message = err?.error?.error || 'No se pudo actualizar el usuario';
        this.showToast(message, 'error');
        this.savingUser = false;
      },
    });
  }

  confirmDeleteManagedUser(user: ManagedUser): void {
    if (!user || !user.id) return;
    this.confirmMessage = `¿Deseas excluir a ${user.nombre}?`;
    this.confirmAction = 'deleteManagedUser';
    this.confirmTargetId = user.id;
    this.showConfirmModal = true;
  }

  private deleteManagedUser(id: number): void {
    this.datos.deleteManagedUser(id).subscribe({
      next: () => {
        this.showToast('Usuario excluido', 'success');
        this.managedUsers = this.managedUsers.filter((u) => u.id !== id);
        if (this.editingUserId === id) {
          this.closeUserModal();
          this.startCreateUser();
        }
      },
      error: (err) => {
        console.error('Error deleting user', err);
        this.showToast('No se pudo excluir el usuario', 'error');
      },
    });
  }

  private createEmptyUserForm(): UserFormModel {
    return {
      nombre: '',
      email: '',
      telefono: '',
      rol: 'cliente',
      password: '',
    };
  }

  // Getters to split orders into columns similar to projects
  get orderTodoList(): any[] {
    return this.orders.filter((o) => {
      const s = (o.estado || o.status || '').toString().toLowerCase();
      return s === 'pendiente' || s === 'to-do' || s === 'todo' || s === '';
    });
  }

  get orderInProgressList(): any[] {
    return this.orders.filter((o) => {
      const s = (o.estado || o.status || '').toString().toLowerCase();
      return (
        s.includes('in progress') ||
        s === 'inprogress' ||
        s.includes('progreso') ||
        s.includes('proceso')
      );
    });
  }

  get orderDoneList(): any[] {
    return this.orders.filter((o) => {
      const s = (o.estado || o.status || '').toString().toLowerCase();
      return s === 'done' || s === 'finalizado' || s === 'done' || s.includes('done');
    });
  }

  // Called when admin switches tabs (0: pendientes, 1: to-do, 2: architect pending, 3: architect accepted, 4: sketchup, 5: pedidos, 6: clientes, 7: mensajes)
  onTabChange(index: number): void {
    switch (index) {
      case 0:
        this.loadPending();
        break;
      case 1:
        this.loadAcceptedProjects();
        break;
      case 2:
        this.loadArchitectProjects('pending');
        break;
      case 3:
        this.loadArchitectProjects('accepted');
        break;
      case 4:
        this.loadSketchupProjects();
        break;
      case 5:
        this.loadOrders();
        break;
      case 6:
        this.loadManagedUsers();
        break;
      case 7:
        this.loadMessages();
        break;
      default:
        break;
    }
  }

  // Grouped getters for To-Do columns
  get todoProjectsList(): any[] {
    return this.acceptedProjects.filter(
      (p) =>
        (p.carpintero_estado || '').toLowerCase() === 'to-do' ||
        (p.carpintero_estado || '').toLowerCase() === 'todo'
    );
  }

  get inProgressProjectsList(): any[] {
    return this.acceptedProjects.filter(
      (p) =>
        (p.carpintero_estado || '').toLowerCase() === 'in progress' ||
        (p.carpintero_estado || '').toLowerCase() === 'inprogress'
    );
  }

  get doneProjectsList(): any[] {
    return this.acceptedProjects.filter(
      (p) => (p.carpintero_estado || '').toLowerCase() === 'done'
    );
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
      error: () => this.showToast('Error guardando estado', 'error'),
    });
  }

  // Save order status (local update; backend endpoint can be added later)
  saveOrderStatus(order: any): void {
    if (!order || !order.id) return;
    const newStatus = order.pendingEstado ?? order.estado;
    if (
      (order.estado || '').toString().toLowerCase() === (newStatus || '').toString().toLowerCase()
    ) {
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
      },
    });
  }

  // Request confirmation before saving a single project
  requestSaveProject(proj: any): void {
    if (!proj || !proj.proyecto_id) return;
    this.confirmMessage = 'Deseas guardar los cambios en este proyecto?';
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
    this.confirmMessage = 'Deseas guardar los cambios en todos los proyectos aceptados?';
    this.confirmAction = 'saveAllAccepted';
    this.confirmTargetId = null;
    this.showConfirmModal = true;
  }

  // Save all accepted projects at once
  saveAllAccepted(): void {
    const saves = this.acceptedProjects.map((p) => {
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
          error: () => {
            resolve();
          },
        });
      });
    });
    Promise.all(saves).then(() => {
      this.loadAcceptedProjects();
      this.showToast('Todos los cambios guardados', 'success');
    });
  }

  updateProgress(proyectoId: number, estado: string): void {
    this.datos.updateProjectProgress(proyectoId, estado).subscribe({
      next: () => this.loadTodoList(),
      error: (err) => this.showToast('Error actualizando progreso', 'error'),
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
        error: () => this.showToast('Error aceptando presupuesto', 'error'),
      });
      } else if (action === 'saveProject' && target) {
        const proj = this.acceptedProjects.find((p: any) => p.proyecto_id === target);
        if (proj) {
          this.saveProject(proj);
        } else {
        this.datos.updateProjectProgress(target, 'to-do').subscribe({
          next: () => this.showToast('Estado actualizado', 'success'),
          error: () => this.showToast('Error guardando estado', 'error'),
        });
      }
      } else if (action === 'saveAllAccepted') {
        this.saveAllAccepted();
      } else if (action === 'deleteManagedUser' && target) {
        this.deleteManagedUser(target);
      } else if (action === 'deleteSketchupProject' && target) {
        this.deleteSketchupProject(target);
      }
    }

  loadMessages(): void {
    this.messagesLoading = true;
    this.messagesError = '';
    this.datos.getAdminMessages().subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.messages)) {
          this.contactMessages = res.messages.map((msg) => ({ ...msg, pendingResponse: '' }));
          if (typeof res.unread_count === 'number') {
            this.unreadMessageCount = res.unread_count;
          } else {
            this.updateUnreadCountFromMessages();
          }
        } else {
          this.contactMessages = [];
          this.unreadMessageCount = 0;
        }
        this.messagesLoading = false;
      },
      error: (err) => {
        console.error('Error loading messages', err);
        this.messagesLoading = false;
        this.messagesError = 'Unable to load messages.';
      },
    });
  }

  private updateUnreadCountFromMessages(): void {
    this.unreadMessageCount = this.contactMessages.reduce((count, msg) => {
      const isUnread = Number(msg.admin_unread ?? 0) === 1;
      return count + (isUnread ? 1 : 0);
    }, 0);
  }

  markMessageStatus(
    msg: ContactMessage & { pendingResponse?: string },
    state: 'new' | 'read'
  ): void {
    if (!msg || !msg.id) return;
    const isCurrentlyUnread = Number(msg.admin_unread ?? 0) === 1;
    if ((state === 'read' && !isCurrentlyUnread) || (state === 'new' && isCurrentlyUnread)) {
      return;
    }
    this.datos.updateMessageStatus(msg.id, state).subscribe({
      next: () => {
        msg.admin_unread = state === 'new' ? 1 : 0;
        if (state === 'read' && msg.status === 'new') {
          msg.status = 'read';
        } else if (state === 'new' && msg.status === 'read') {
          msg.status = 'new';
        }
        this.updateUnreadCountFromMessages();
        this.showToast(
          state === 'read' ? 'Mensaje marcado como leído' : 'Mensaje marcado como no leído',
          'info'
        );
      },
      error: (err) => {
        console.error('Error updating message status', err);
        this.showToast('No se pudo actualizar el estado del mensaje', 'error');
      },
    });
  }

  isMessageUnread(msg: ContactMessage): boolean {
    return Number(msg.admin_unread ?? 0) === 1;
  }

  formatMessageStatus(status: string): string {
    if (!status) return 'New';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  sendResponse(msg: ContactMessage & { pendingResponse?: string }): void {
    if (!msg || !msg.id || !msg.pendingResponse?.trim()) {
      this.showToast('Por favor escribe una respuesta antes de enviar.', 'warning');
      return;
    }
    const responseText = msg.pendingResponse.trim();
    this.datos.replyToMessage(msg.id, responseText).subscribe({
      next: () => {
        this.showToast('Respuesta enviada al cliente', 'success');
        msg.response = responseText;
        msg.pendingResponse = '';
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error sending response', err);
        this.showToast('No se pudo enviar la respuesta', 'error');
      },
    });
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
      error: () => this.showToast('Error aceptando presupuesto', 'error'),
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
    } else if (
      data.presupuestos &&
      Array.isArray(data.presupuestos) &&
      data.presupuestos.length === 1
    ) {
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
  showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    duration = 3000
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastDuration = duration;
    this.toastVisible = true;
    // Auto hide after duration + small buffer
    setTimeout(() => {
      this.toastVisible = false;
    }, duration + 400);
  }
}
