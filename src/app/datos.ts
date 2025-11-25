import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

// Interfaces for products
export interface Color {
  name: string;
  code: string;
  codigo_hex?: string;
  nombre?: string;
}

export interface CustomFurnitureOptionPayload {
  id?: number;
  service: string;
  name: string;
  type: string;
  basePrice: number;
  image?: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  depth: number;
  availableColors: Color[];
}

export interface Dimensions {
  width: string;
  height: string;
  depth: string;
}

export interface Product {
  id: number;
  name: string;
  collection?: string;
  description: string;
  category: string;
  type: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  stock: number;
  image: string;
  style?: string;
  colors: Color[];
  includes?: string[];
  dimensions?: Dimensions;
}

// Interface for showcase projects
export interface ShowcaseProject {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: 'kitchen' | 'bathroom' | 'bedroom' | 'livingroom' | 'others';
  cliente: string;
  ubicacion: string;
  fecha_completado: string;
  duracion_dias: number;
  presupuesto: number;
  imagenes: string[];
  estilo: string;
  area_m2: number;
  materiales: string[];
  destacado: boolean;
}

export interface ManagedUser {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: 'cliente' | 'arquitecto';
  fecha_registro?: string | null;
}

export interface ManagedUserPayload {
  nombre?: string;
  email?: string;
  telefono?: string | null;
  rol?: 'cliente' | 'arquitecto';
  password?: string;
}

export interface ArchitectProject {
  id: number;
  architect_id: number;
  architect_name?: string;
  architect_email?: string;
  project_title?: string | null;
  project_notes: string;
  file_path?: string | null;
  file_original_name?: string | null;
  file_url?: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  admin_comment?: string | null;
  decided_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface SketchupProject {
  id: number;
  admin_id?: number;
  title?: string | null;
  notes?: string | null;
  file_path: string;
  file_original_name?: string | null;
  embed_url?: string | null;
  file_url?: string | null;
  created_at?: string;
}

export interface FavoriteItem {
  id: number;
  item_type: 'product' | 'service' | 'custom';
  item_id?: number | null;
  item_slug?: string | null;
  item_name: string;
  item_image?: string | null;
  item_price?: number | null;
  extra?: any;
  created_at?: string;
}

export interface FavoritePayload {
  item_type: 'product' | 'service' | 'custom';
  item_id?: number | string | null;
  item_slug?: string | null;
  item_name: string;
  item_image?: string | null;
  item_price?: number | null;
  extra?: any;
}

@Injectable({
  providedIn: 'root',
})
export class Datos {
  url = 'http://localhost/moderni/';
  // Emit when a product is updated so other components can refresh their local lists
  private productUpdated = new Subject<any>();
  productUpdated$ = this.productUpdated.asObservable();
  private productsChanged = new Subject<string | null>();
  productsChanged$ = this.productsChanged.asObservable();
  private showcaseProjectsChanged = new Subject<string | null>();
  showcaseProjectsChanged$ = this.showcaseProjectsChanged.asObservable();

  // Emit cuando se crea un producto nuevo (para que las páginas se actualicen en caliente)
  private productCreated = new Subject<any>();
  productCreated$ = this.productCreated.asObservable();
  // Emit cuando se borra un producto (para quitar la card en caliente)
  private productDeleted = new Subject<number>();
  productDeleted$ = this.productDeleted.asObservable();

  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>([]);
  favorites$ = this.favoritesSubject.asObservable();
  private favoritesLoaded = false;

  private myMessagesSubject = new BehaviorSubject<ContactMessage[]>([]);
  myMessages$ = this.myMessagesSubject.asObservable();
  private myMessagesLoaded = false;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const loginData = {
      email: email,
      password: password,
    };
    return this.http.post(this.url + 'login.php', loginData, { withCredentials: true });
  }

  signup(
    nombre: string,
    email: string,
    password: string,
    telefono?: string,
    rol: string = 'cliente'
  ): Observable<any> {
    const signupData = {
      nombre: nombre,
      email: email,
      password: password,
      telefono: telefono,
      rol: rol,
    };
    return this.http.post(this.url + 'signup.php', signupData);
  }

  logout(): Observable<any> {
    return this.http.post(this.url + 'logout.php', {}, { withCredentials: true });
  }

  savePushToken(payload: { token: string; userId?: number; platform?: string }): Observable<any> {
    const body: any = {
      token: payload.token,
      platform: payload.platform ?? 'web'
    };

    if (payload.userId) {
      body.userId = payload.userId;
    }

    return this.http.post(this.url + 'save_fcm_token.php', body, { withCredentials: true });
  }

  // Get all products or filter by category
  getProducts(category?: string): Observable<Product[]> {
    let endpoint = this.url + 'get_products.php';
    if (category) {
      endpoint += `?categoria=${encodeURIComponent(category)}`;
    }
    return this.http.get<Product[]>(endpoint);
  }

  // Get products by type (individual, set_kitchen, set_bathroom, etc.)
  getProductsByType(type: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + `get_products.php?tipo=${encodeURIComponent(type)}`);
  }

  // Get a single product by ID
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(this.url + `get_product.php?id=${id}`);
  }

  // Get all kitchen sets
  getKitchenSets(): Observable<Product[]> {
    return this.getProductsByType('set_kitchen');
  }

  // Get all bathroom sets
  getBathroomSets(): Observable<Product[]> {
    return this.getProductsByType('set_bathroom');
  }

  // Get all bedroom sets
  getBedroomSets(): Observable<Product[]> {
    return this.getProductsByType('set_bedroom');
  }

  // Get all living room sets
  getLivingRoomSets(): Observable<Product[]> {
    return this.getProductsByType('set_livingroom');
  }

  // Get individual furniture (Others category)
  getIndividualProducts(): Observable<Product[]> {
    return this.getProductsByType('individual');
  }

  // Custom furniture options per service (bathroom, kitchen, etc.)
  getCustomFurnitureOptions(service: string): Observable<any[]> {
    return this.http
      .get<{ success: boolean; options: any[] }>(
        this.url + `custom_furniture_options.php?service=${encodeURIComponent(service)}`
      )
      .pipe(map((res) => (res && res.success && Array.isArray(res.options) ? res.options : [])));
  }

  createCustomFurnitureOption(
    payload: CustomFurnitureOptionPayload
  ): Observable<{ success: boolean; option?: any }> {
    return this.http.post<{ success: boolean; option?: any }>(
      this.url + 'custom_furniture_options.php',
      payload,
      { withCredentials: true }
    );
  }

  updateCustomFurnitureOption(
    id: number,
    payload: CustomFurnitureOptionPayload
  ): Observable<{ success: boolean; option?: any }> {
    return this.http.put<{ success: boolean; option?: any }>(
      this.url + `custom_furniture_options.php?id=${id}`,
      { ...payload, id },
      { withCredentials: true }
    );
  }

  deleteCustomFurnitureOption(id: number): Observable<{ success: boolean }> {
    return this.http.request<{ success: boolean }>(
      'DELETE',
      this.url + `custom_furniture_options.php?id=${id}`,
      { withCredentials: true }
    );
  }

  // ===== SHOWCASE PROJECTS METHODS =====

  // Get all showcase projects or filter by category
  getShowcaseProjects(category?: string): Observable<ShowcaseProject[]> {
    let endpoint = this.url + 'get_showcase_projects.php';
    if (category) {
      endpoint += `?categoria=${encodeURIComponent(category)}`;
    }
    return this.http.get<ShowcaseProject[]>(endpoint);
  }

  // Get showcase projects by specific category
  getKitchenProjects(): Observable<ShowcaseProject[]> {
    return this.getShowcaseProjects('kitchen');
  }

  getBathroomProjects(): Observable<ShowcaseProject[]> {
    return this.getShowcaseProjects('bathroom');
  }

  getBedroomProjects(): Observable<ShowcaseProject[]> {
    return this.getShowcaseProjects('bedroom');
  }

  getLivingRoomProjects(): Observable<ShowcaseProject[]> {
    return this.getShowcaseProjects('livingroom');
  }

  getOthersProjects(): Observable<ShowcaseProject[]> {
    return this.getShowcaseProjects('others');
  }
  // Get logged user from backend (no local/session storage)
  getLoggedUser(): Observable<any> {
    return this.http.get<any>(this.url + 'get_logged_user.php', { withCredentials: true });
  }

  // ===== CARPINTERO / ADMIN ENDPOINTS =====

  // Get pending presupuestos for carpintero/admin
  getPendingPresupuestos(): Observable<any> {
    return this.http.get<any>(this.url + 'get_presupuestos.php', { withCredentials: true });
  }

  // Accept a presupuesto (moves proyecto to carpintero to-do)
  acceptPresupuesto(presupuestoId: number, finalPrice?: number): Observable<any> {
    const payload: any = { presupuesto_id: presupuestoId };
    if (typeof finalPrice === 'number') payload.final_price = finalPrice;
    return this.http.post<any>(this.url + 'accept_presupuesto.php', payload, {
      withCredentials: true,
    });
  }

  // Reject a presupuesto with reason (backend will attempt to email client)
  rejectPresupuesto(presupuestoId: number, motivo: string): Observable<any> {
    return this.http.post<any>(
      this.url + 'reject_presupuesto.php',
      { presupuesto_id: presupuestoId, motivo: motivo },
      { withCredentials: true }
    );
  }

  // Get carpintero to-do list (projects grouped by client on frontend)
  getTodoList(): Observable<any> {
    return this.http.get<any>(this.url + 'get_todo_list.php', { withCredentials: true });
  }

  // Get full project/order details including furniture and space dimensions
  // (revert) sin endpoint de detalles

  // Create a custom order (from services 'Make it your own')
  createCustomOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.url + 'create_custom_order.php', orderData, {
      withCredentials: true,
    });
  }

  // Create a normal pedido (from cart checkout)
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.url + 'create_order.php', orderData, { withCredentials: true });
  }

  // Get all non-custom orders (pedidos) for admin
  getOrders(): Observable<any> {
    return this.http.get<any>(this.url + 'get_orders.php', { withCredentials: true });
  }

  // Update an order's status (persist in pedidos.status)
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.post<any>(
      this.url + 'update_order_status.php',
      { id: orderId, status: status },
      { withCredentials: true }
    );
  }

  getManagedUsers(): Observable<ManagedUser[]> {
    return this.http
      .get<{ success: boolean; users: ManagedUser[] }>(this.url + 'manage_users.php', {
        withCredentials: true,
      })
      .pipe(
        map((res) => (res && res.success && Array.isArray(res.users) ? res.users : []))
      );
  }

  createManagedUser(
    payload: ManagedUserPayload & { nombre: string; email: string; rol: 'cliente' | 'arquitecto'; password: string }
  ): Observable<ManagedUser> {
    return this.http
      .post<{ success: boolean; user?: ManagedUser }>(this.url + 'manage_users.php', payload, {
        withCredentials: true,
      })
      .pipe(map((res) => (res && res.success && res.user ? res.user : (null as any))));
  }

  updateManagedUser(id: number, payload: ManagedUserPayload): Observable<ManagedUser> {
    return this.http
      .put<{ success: boolean; user?: ManagedUser }>(this.url + `manage_users.php?id=${id}`, payload, {
        withCredentials: true,
      })
      .pipe(map((res) => (res && res.success && res.user ? res.user : (null as any))));
  }

  deleteManagedUser(id: number): Observable<boolean> {
    return this.http
      .request<{ success: boolean }>('DELETE', this.url + `manage_users.php?id=${id}`, {
        withCredentials: true,
      })
      .pipe(map((res) => !!(res && res.success)));
  }

  submitArchitectProject(formData: FormData): Observable<ArchitectProject> {
    return this.http
      .post<{ success: boolean; project: ArchitectProject }>(
        this.url + 'submit_architect_project.php',
        formData,
        { withCredentials: true }
      )
      .pipe(map((res) => res?.project as ArchitectProject));
  }

  getArchitectProjects(
    status: 'pending' | 'accepted' | 'rejected' | 'all' = 'all'
  ): Observable<ArchitectProject[]> {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return this.http
      .get<{ success: boolean; projects: ArchitectProject[] }>(
        this.url + 'get_architect_projects.php' + query,
        { withCredentials: true }
      )
      .pipe(map((res) => (res && Array.isArray(res.projects) ? res.projects : [])));
  }

  updateArchitectProjectStatus(
    projectId: number,
    status: 'accepted' | 'rejected',
    adminComment?: string
  ): Observable<ArchitectProject> {
    return this.http
      .post<{ success: boolean; project: ArchitectProject }>(
        this.url + 'update_architect_project_status.php',
        { project_id: projectId, status, admin_comment: adminComment ?? null },
        { withCredentials: true }
      )
      .pipe(map((res) => res?.project as ArchitectProject));
  }

  // Get orders for the currently logged user (both normal pedidos and custom presupuestos)
  getMyOrders(email?: string): Observable<any> {
    let endpoint = this.url + 'get_my_orders.php';
    if (email) endpoint += `?email=${encodeURIComponent(email)}`;
    return this.http.get<any>(endpoint, { withCredentials: true });
  }

  submitOrderReview(payload: OrderReviewPayload): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(this.url + 'submit_review.php', payload, {
      withCredentials: true,
    });
  }

  getPublicReviews(): Observable<{ success: boolean; reviews: PublicReview[] }> {
    return this.http.get<{ success: boolean; reviews: PublicReview[] }>(
      this.url + 'get_reviews.php'
    );
  }

  // Update project progress (to-do, in progress, done)
  updateProjectProgress(proyectoId: number, estado: string): Observable<any> {
    return this.http.post<any>(
      this.url + 'update_project_progress.php',
      { proyecto_id: proyectoId, estado: estado },
      { withCredentials: true }
    );
  }

  // Update a product (admin) - expects payload with id and fields to update
  updateProduct(productData: any): Observable<any> {
    // Notify other parts of the app when the server returns the updated product
    return this.http
      .post<any>(this.url + 'update_product.php', productData, { withCredentials: true })
      .pipe(
        tap((res: any) => {
          if (res && res.success && res.product) {
            // forward the updated product to any subscribers
            try {
              this.notifyProductUpdated(res.product);
            } catch (e) {
              /* noop */
            }
            try {
              this.notifyProductsChanged(productData?.type ?? productData?.tipo_producto ?? null);
            } catch (e) {
              /* noop */
            }
          }
        })
      );
  }

  createProduct(productData: any): Observable<any> {
    return this.http
      .post<any>(this.url + 'create_product.php', productData, { withCredentials: true })
      .pipe(
        tap((res: any) => {
          if (res && res.success) {
            // 1) Notificar “productos cambiados”
            try {
              this.notifyProductsChanged(productData?.type ?? productData?.tipo_producto ?? null);
            } catch (e) {
              /* noop */
            }

            // 2) Notificar “producto creado” para que las páginas inserten la card al instante
            // usar el objeto retornado por el backend; si no viene, reconstruimos mínimo con productData + id.
            const created = res.product
              ? res.product
              : { ...productData, id: res.id ?? res.product_id ?? res.newId ?? null };

            try {
              this.notifyProductCreated(created);
            } catch (e) {
              /* noop */
            }
          }
        })
      );
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http
      .post<any>(this.url + 'delete_product.php', { id: productId }, { withCredentials: true })
      .pipe(
        tap((res: any) => {
          if (res && res.success) {
            // 1) Notificar “productos cambiados”
            try {
              this.notifyProductsChanged(null);
            } catch (e) {
              /* noop */
            }

            // 2) Notificar “producto borrado” para que las páginas eliminen la card al instante
            try {
              this.notifyProductDeleted(productId);
            } catch (e) {
              /* noop */
            }
          }
        })
      );
  }

  // Notify listeners that a product was updated (call after successful update)
  notifyProductUpdated(product: any) {
    try {
      this.productUpdated.next(product);
    } catch (e) {
      /* noop */
    }
  }

  // Notifica a los listeners que se ha creado un producto
  notifyProductCreated(product: any) {
    try {
      this.productCreated.next(product);
    } catch (e) {
      /* noop */
    }
  }

  // Notifica a los listeners que se ha borrado un producto
  notifyProductDeleted(id: number) {
    try {
      this.productDeleted.next(id);
    } catch (e) {
      /* noop */
    }
  }

  notifyProductsChanged(productType?: string | null) {
    try {
      this.productsChanged.next(productType ?? null);
    } catch (e) {
      /* noop */
    }
  }

  notifyShowcaseProjectsChanged(category?: string | null) {
    try {
      this.showcaseProjectsChanged.next(category ?? null);
    } catch (e) {
      /* noop */
    }
  }

  createShowcaseProject(projectData: any): Observable<any> {
    return this.http
      .post<any>(this.url + 'create_showcase_project.php', projectData, { withCredentials: true })
      .pipe(
        tap((res: any) => {
          if (res && res.success) {
            try {
              this.notifyShowcaseProjectsChanged(
                projectData?.categoria ?? projectData?.category ?? null
              );
            } catch (e) {
              /* noop */
            }
          }
        })
      );
  }

  deleteShowcaseProject(projectId: number): Observable<any> {
    return this.http
      .post<any>(
        this.url + 'delete_showcase_project.php',
        { id: projectId },
        { withCredentials: true }
      )
      .pipe(
        tap((res: any) => {
          if (res && res.success) {
            try {
              this.notifyShowcaseProjectsChanged(null);
            } catch (e) {
              /* noop */
            }
          }
        })
      );
  }

  // ==== Favorites ====
  loadFavorites(force = false): Observable<FavoriteItem[]> {
    if (this.favoritesLoaded && !force) {
      return of(this.favoritesSubject.value);
    }
    return this.http
      .get<{ success: boolean; favorites: FavoriteItem[] }>(this.url + 'favorites.php', {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (res && res.success && Array.isArray(res.favorites)) {
            this.favoritesLoaded = true;
            this.favoritesSubject.next(res.favorites);
          }
        }),
        map(() => this.favoritesSubject.value)
      );
  }

  addFavorite(payload: FavoritePayload): Observable<FavoriteItem[]> {
    return this.http
      .post<{ success: boolean; favorites: FavoriteItem[] }>(this.url + 'favorites.php', payload, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (res && res.success && Array.isArray(res.favorites)) {
            this.favoritesLoaded = true;
            this.favoritesSubject.next(res.favorites);
          }
        }),
        map(() => this.favoritesSubject.value)
      );
  }

  removeFavoriteById(id: number): Observable<FavoriteItem[]> {
    return this.http
      .request<{ success: boolean; favorites: FavoriteItem[] }>(
        'DELETE',
        this.url + 'favorites.php',
        {
          withCredentials: true,
          body: { id },
        }
      )
      .pipe(
        tap((res) => {
          if (res && res.success && Array.isArray(res.favorites)) {
            this.favoritesSubject.next(res.favorites);
          }
        }),
        map(() => this.favoritesSubject.value)
      );
  }

  removeFavorite(payload: {
    item_type: string;
    item_id?: number | string | null;
    item_slug?: string | null;
  }): Observable<FavoriteItem[]> {
    return this.http
      .request<{ success: boolean; favorites: FavoriteItem[] }>(
        'DELETE',
        this.url + 'favorites.php',
        {
          withCredentials: true,
          body: payload,
        }
      )
      .pipe(
        tap((res) => {
          if (res && res.success && Array.isArray(res.favorites)) {
            this.favoritesSubject.next(res.favorites);
          }
        }),
        map(() => this.favoritesSubject.value)
      );
  }

  getCurrentFavorites(): FavoriteItem[] {
    return this.favoritesSubject.value;
  }

  // ==== SketchUp projects (admin) ====
  getSketchupProjects(): Observable<SketchupProject[]> {
    return this.http
      .get<{ success: boolean; projects: SketchupProject[] }>(
        this.url + 'get_sketchup_projects.php',
        { withCredentials: true }
      )
      .pipe(map((res) => (res && res.success && Array.isArray(res.projects) ? res.projects : [])));
  }

  uploadSketchupProject(payload: {
    file: File;
    title?: string;
    notes?: string;
    embedUrl?: string;
  }): Observable<SketchupProject> {
    const form = new FormData();
    form.append('skp_file', payload.file);
    if (payload.title) form.append('title', payload.title);
    if (payload.notes) form.append('notes', payload.notes);
    const embed = payload.embedUrl?.trim();
    if (embed) form.append('embed_url', embed);

    return this.http
      .post<{ success: boolean; project: SketchupProject }>(
        this.url + 'upload_sketchup_project.php',
        form,
        { withCredentials: true }
      )
      .pipe(map((res) => (res && res.success && res.project ? res.project : ({} as SketchupProject))));
  }

  deleteSketchupProject(projectId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      this.url + 'delete_sketchup_project.php',
      { project_id: projectId },
      { withCredentials: true }
    );
  }

  // ==== Contact messages ====
  sendContactMessage(payload: ContactMessagePayload): Observable<any> {
    return this.http.post<any>(this.url + 'send_message.php', payload, { withCredentials: true });
  }

  getAdminMessages(): Observable<{
    success: boolean;
    messages: ContactMessage[];
    unread_count?: number;
  }> {
    return this.http.get<{ success: boolean; messages: ContactMessage[]; unread_count?: number }>(
      this.url + 'get_messages.php',
      { withCredentials: true }
    );
  }

  updateMessageStatus(
    messageId: number,
    status: 'new' | 'read'
  ): Observable<{ success: boolean; status: string }> {
    return this.http.post<{ success: boolean; status: string }>(
      this.url + 'update_message_status.php',
      { message_id: messageId, status },
      { withCredentials: true }
    );
  }

  replyToMessage(messageId: number, response: string): Observable<any> {
    return this.http.post<any>(
      this.url + 'reply_message.php',
      { message_id: messageId, response },
      { withCredentials: true }
    );
  }

  loadMyMessages(force = false): Observable<ContactMessage[]> {
    if (this.myMessagesLoaded && !force) {
      return of(this.myMessagesSubject.value);
    }
    return this.http
      .get<{ success: boolean; messages: ContactMessage[] }>(this.url + 'get_my_messages.php', {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (res && res.success && Array.isArray(res.messages)) {
            this.myMessagesLoaded = true;
            this.myMessagesSubject.next(res.messages);
          }
        }),
        map(() => this.myMessagesSubject.value)
      );
  }

  getCurrentMessages(): ContactMessage[] {
    return this.myMessagesSubject.value;
  }
}
export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  user_id?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: 'new' | 'read' | 'responded' | 'closed' | string;
  admin_unread?: number;
  response?: string | null;
  response_user_id?: number | null;
  response_created_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  admin_name?: string | null;
  user_nombre?: string | null;
}

export interface OrderReviewPayload {
  order_id: number;
  order_type: 'pedido' | 'custom';
  rating: number;
  comment?: string;
}

export interface PublicReview {
  id: number;
  order_id?: number;
  order_type?: 'pedido' | 'custom';
  user_name: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}
