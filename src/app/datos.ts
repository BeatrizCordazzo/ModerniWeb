import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

// Interfaces for products
export interface Color {
  name: string;
  code: string;
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
  providedIn: 'root'
})
export class Datos {
  url = 'http://localhost/moderni/'
  // Emit when a product is updated so other components can refresh their local lists
  private productUpdated = new Subject<any>();
  productUpdated$ = this.productUpdated.asObservable();

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
      password: password
    }
    return this.http.post(this.url + 'login.php', loginData, { withCredentials: true })
  }

  signup(nombre: string, email: string, password: string, telefono?: string, rol: string = 'cliente'): Observable<any> {
    const signupData = {
      nombre: nombre,
      email: email,
      password: password,
      telefono: telefono,
      rol: rol
    }
    return this.http.post(this.url + 'signup.php', signupData)
  }

  logout(): Observable<any> {
    return this.http.post(this.url + 'logout.php', {}, { withCredentials: true });
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
    return this.http.post<any>(this.url + 'accept_presupuesto.php', payload, { withCredentials: true });
  }

  // Reject a presupuesto with reason (backend will attempt to email client)
  rejectPresupuesto(presupuestoId: number, motivo: string): Observable<any> {
    return this.http.post<any>(this.url + 'reject_presupuesto.php', { presupuesto_id: presupuestoId, motivo: motivo }, { withCredentials: true });
  }

  // Get carpintero to-do list (projects grouped by client on frontend)
  getTodoList(): Observable<any> {
    return this.http.get<any>(this.url + 'get_todo_list.php', { withCredentials: true });
  }

  // Get full project/order details including furniture and space dimensions
  // (revert) sin endpoint de detalles

  // Create a custom order (from services 'Make it your own')
  createCustomOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.url + 'create_custom_order.php', orderData, { withCredentials: true });
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
    return this.http.post<any>(this.url + 'update_order_status.php', { id: orderId, status: status }, { withCredentials: true });
  }

  // Get orders for the currently logged user (both normal pedidos and custom presupuestos)
  getMyOrders(email?: string): Observable<any> {
    let endpoint = this.url + 'get_my_orders.php';
    if (email) endpoint += `?email=${encodeURIComponent(email)}`;
    return this.http.get<any>(endpoint, { withCredentials: true });
  }

  // Update project progress (to-do, in progress, done)
  updateProjectProgress(proyectoId: number, estado: string): Observable<any> {
    return this.http.post<any>(this.url + 'update_project_progress.php', { proyecto_id: proyectoId, estado: estado }, { withCredentials: true });
  }

  // Update a product (admin) - expects payload with id and fields to update
  updateProduct(productData: any): Observable<any> {
    // Notify other parts of the app when the server returns the updated product
    return this.http.post<any>(this.url + 'update_product.php', productData, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res && res.success && res.product) {
          // forward the updated product to any subscribers
          try { this.notifyProductUpdated(res.product); } catch (e) { /* noop */ }
        }
      })
    );
  }

  // Notify listeners that a product was updated (call after successful update)
  notifyProductUpdated(product: any) {
    try { this.productUpdated.next(product); } catch (e) { /* noop */ }
  }

  // ==== Favorites ====
  loadFavorites(force = false): Observable<FavoriteItem[]> {
    if (this.favoritesLoaded && !force) {
      return of(this.favoritesSubject.value);
    }
    return this.http.get<{ success: boolean; favorites: FavoriteItem[] }>(this.url + 'favorites.php', { withCredentials: true }).pipe(
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
    return this.http.post<{ success: boolean; favorites: FavoriteItem[] }>(this.url + 'favorites.php', payload, { withCredentials: true }).pipe(
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
    return this.http.request<{ success: boolean; favorites: FavoriteItem[] }>('DELETE', this.url + 'favorites.php', {
      withCredentials: true,
      body: { id }
    }).pipe(
      tap((res) => {
        if (res && res.success && Array.isArray(res.favorites)) {
          this.favoritesSubject.next(res.favorites);
        }
      }),
      map(() => this.favoritesSubject.value)
    );
  }

  removeFavorite(payload: { item_type: string; item_id?: number | string | null; item_slug?: string | null }): Observable<FavoriteItem[]> {
    return this.http.request<{ success: boolean; favorites: FavoriteItem[] }>('DELETE', this.url + 'favorites.php', {
      withCredentials: true,
      body: payload
    }).pipe(
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

  // ==== Contact messages ====
  sendContactMessage(payload: ContactMessagePayload): Observable<any> {
    return this.http.post<any>(this.url + 'send_message.php', payload, { withCredentials: true });
  }

  getAdminMessages(): Observable<{ success: boolean; messages: ContactMessage[] }> {
    return this.http.get<{ success: boolean; messages: ContactMessage[] }>(this.url + 'get_messages.php', { withCredentials: true });
  }

  replyToMessage(messageId: number, response: string): Observable<any> {
    return this.http.post<any>(this.url + 'reply_message.php', { message_id: messageId, response }, { withCredentials: true });
  }

  loadMyMessages(force = false): Observable<ContactMessage[]> {
    if (this.myMessagesLoaded && !force) {
      return of(this.myMessagesSubject.value);
    }
    return this.http.get<{ success: boolean; messages: ContactMessage[] }>(this.url + 'get_my_messages.php', { withCredentials: true }).pipe(
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
  response?: string | null;
  response_user_id?: number | null;
  response_created_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  admin_name?: string | null;
  user_nombre?: string | null;
}
