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
  savingUser = false;
  createUserForm: UserFormModel = this.createEmptyUserForm();

  private readonly nameRegex = /^[A-Za-z\u00C0-\u024F\s]+$/;
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly phoneRegex = /^[0-9+()\s-]{7,20}$/;

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
      this.showToast('Please state the reason for rejection.', 'warning');
      return;
    }
    this.datos.rejectPresupuesto(this.rejectionTargetId, this.rejectionMotivo).subscribe({
      next: (res: any) => {
        this.closeModal();
        this.loadPending();
        this.showToast('Quote rejected and customer notified', 'success');
      },
      error: (err) => {
        this.showToast('Error rejecting quote', 'error');
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
        this.managedUsersError = 'Failed to load users.';
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
          this.architectPendingError = 'Failed to load architect projects.';
          this.architectPendingLoading = false;
        } else {
          this.architectAcceptedError = 'Failed to load accepted projects.';
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
          decision === 'accepted' ? 'Project accepted' : 'Project rejected',
          'success'
        );
        delete this.architectDecisionSaving[project.id];
        delete this.architectDecisionComments[project.id];
        this.loadArchitectProjects('pending');
        this.loadArchitectProjects('accepted');
      },
      error: (err) => {
        console.error('Error updating architect project', err);
        this.showToast('Failed to update project.', 'error');
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
        this.sketchupError = 'Failed to load models.';
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
      this.sketchupError = 'Only .skp files are allowed.';
      this.sketchupFile = null;
      return;
    }
    this.sketchupError = '';
    this.sketchupFile = file;
  }

  uploadSketchupModel(): void {
    if (!this.sketchupFile) {
      this.sketchupError = 'Select an .skp file to upload.';
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
            this.showToast('SketchUp model uploaded', 'success');
          } else {
            this.sketchupError = 'Failed to register the model.';
          }
          this.sketchupUploading = false;
        },
        error: (err) => {
          console.error('Error uploading SketchUp model', err);
          const msg = err?.error?.error || 'Failed to upload the model.';
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
      this.sketchupError = 'Add the 3D Warehouse iframe for this model.';
      return;
    }
    this.sketchupError = '';
    this.sketchupViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.sketchupSelectedName =
      project.title || project.file_original_name || `Model #${project.id}`;
    this.sketchupViewerProjectId = project?.id ?? null;
  }

  confirmDeleteSketchup(project: SketchupProject): void {
    if (!project || !project.id) return;
    const name = project.title || project.file_original_name || `Model #${project.id}`;
    this.confirmMessage = `Do you want to delete "${name}"?`;
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
        this.showToast('Model deleted', 'success');
      },
      error: (err) => {
        console.error('Error deleting SketchUp project', err);
        delete this.sketchupDeleting[projectId];
        const msg = err?.error?.error || 'Failed to delete the model.';
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


  async submitUserForm(): Promise<void> {
    const form = this.createUserForm;
    const nombre = form.nombre.trim();
    const email = form.email.trim();
    const telefono = form.telefono.trim();
    if (!nombre || !email) {
      this.showToast('Name and email are required', 'warning');
      return;
    }

    if (!this.isValidName(nombre)) {
      this.showToast('Name must have at least 3 letters and no special characters', 'warning');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showToast('Enter a valid email', 'warning');
      return;
    }

    if (telefono && !this.isValidPhone(telefono)) {
      this.showToast('Enter a valid phone number (digits, spaces, +, -, parentheses only)', 'warning');
      return;
    }

    const passwordValue = form.password.trim();
    const passwordError = this.getPasswordValidationError(passwordValue);
    if (passwordError) {
      this.showToast(passwordError, 'warning');
      return;
    }

    let hashedPassword: string;
    try {
      hashedPassword = await this.hashPassword(passwordValue);
    } catch (error) {
      console.error('Error hashing password', error);
      this.showToast('Failed to process the password', 'error');
      return;
    }

    const payload: ManagedUserPayload & {
      nombre: string;
      email: string;
      rol: ManagedUserRole;
      password: string;
    } = {
      nombre,
      email,
      rol: form.rol,
      telefono: telefono ? telefono : null,
      password: hashedPassword,
    };

    this.savingUser = true;
    this.datos.createManagedUser(payload).subscribe({
      next: () => {
        this.showToast('User created', 'success');
        this.savingUser = false;
        // Reset model for the form (button 'Nuevo' and helper removed)
        this.createUserForm = this.createEmptyUserForm();
        this.loadManagedUsers();
      },
      error: (err: any) => {
        console.error('Error saving user', err);
        const message = err?.error?.error || 'Failed to create the user';
        this.showToast(message, 'error');
        this.savingUser = false;
      },
    });
  }

  confirmDeleteManagedUser(user: ManagedUser): void {
    if (!user || !user.id) return;
    this.confirmMessage = `Do you want to delete ${user.nombre}?`;
    this.confirmAction = 'deleteManagedUser';
    this.confirmTargetId = user.id;
    this.showConfirmModal = true;
  }

  private deleteManagedUser(id: number): void {
    this.datos.deleteManagedUser(id).subscribe({
      next: () => {
        this.showToast('User deleted', 'success');
        this.managedUsers = this.managedUsers.filter((u) => u.id !== id);
      },
      error: (err) => {
        console.error('Error deleting user', err);
        this.showToast('Failed to delete the user', 'error');
      },
    });
  }

  private isValidName(value: string): boolean {
    return value.length >= 3 && this.nameRegex.test(value);
  }

  private isValidEmail(value: string): boolean {
    return this.emailRegex.test(value);
  }

  private isValidPhone(value: string): boolean {
    return this.phoneRegex.test(value);
  }

  private getPasswordValidationError(value: string, optional = false): string | null {
    if (!value) {
      return optional ? null : 'Password is required';
    }

    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must include at least one uppercase letter';
    }
    if (!/\d/.test(value)) {
      return 'Password must include at least one number';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
      return 'Password must include at least one special character';
    }

    return null;
  }

  private async hashPassword(plainText: string): Promise<string> {
    if (!plainText) {
      throw new Error('Invalid password value');
    }

    if (!crypto?.subtle) {
      throw new Error('Crypto API not available');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
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
      return s === 'done' || s === 'finalized' || s === 'done' || s.includes('done');
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
      this.showToast('No changes to save', 'info');
      return;
    }
    this.datos.updateProjectProgress(proj.proyecto_id, newStatus).subscribe({
      next: () => {
        proj.carpintero_estado = newStatus;
        delete proj.pendingEstado;
        this.showToast('Status updated', 'success');
        // refresh lists to move project between columns
        this.loadAcceptedProjects();
      },
      error: () => this.showToast('Error saving status', 'error'),
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
      this.showToast('No changes to save', 'info');
      return;
    }
    // Persist the order status via API
    const id = order.id || order.pedido_id;
    this.datos.updateOrderStatus(id, newStatus).subscribe({
      next: (res: any) => {
        order.estado = newStatus;
        delete order.pendingEstado;
        this.showToast('Order status saved', 'success');
        // refresh orders so item moves between columns if needed
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error saving order status', err);
        this.showToast('Error saving order status', 'error');
      },
    });
  }

  // Request confirmation before saving a single project
  requestSaveProject(proj: any): void {
    if (!proj || !proj.proyecto_id) return;
    this.confirmMessage = 'Do you want to save the changes to this project?';
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
      this.showToast('No projects to save', 'info');
      return;
    }
    this.confirmMessage = 'Do you want to save the changes to all accepted projects?';
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
      this.showToast('All changes saved', 'success');
    });
  }

  updateProgress(proyectoId: number, estado: string): void {
    this.datos.updateProjectProgress(proyectoId, estado).subscribe({
      next: () => this.loadTodoList(),
      error: (err) => this.showToast('Error updating progress', 'error'),
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
          this.showToast('Budget accepted', 'success');
        },
        error: () => this.showToast('Error accepting budget', 'error'),
      });
      } else if (action === 'saveProject' && target) {
        const proj = this.acceptedProjects.find((p: any) => p.proyecto_id === target);
        if (proj) {
          this.saveProject(proj);
        } else {
        this.datos.updateProjectProgress(target, 'to-do').subscribe({
          next: () => this.showToast('Status updated', 'success'),
          error: () => this.showToast('Error saving status', 'error'),
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
          state === 'read' ? 'Message marked as read' : 'Message marked as unread',
          'info'
        );
      },
      error: (err) => {
        console.error('Error updating message status', err);
        this.showToast('Unable to update message status', 'error');
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
      this.showToast('Please write a response before sending.', 'warning');
      return;
    }
    const responseText = msg.pendingResponse.trim();
    this.datos.replyToMessage(msg.id, responseText).subscribe({
      next: () => {
        this.showToast('Response sent to client', 'success');
        msg.response = responseText;
        msg.pendingResponse = '';
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error sending response', err);
        this.showToast('Unable to send response', 'error');
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
        this.showToast('Budget accepted and price sent to client', 'success');
      },
      error: () => this.showToast('Error accepting budget', 'error'),
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
