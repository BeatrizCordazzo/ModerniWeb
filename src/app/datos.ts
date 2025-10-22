import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class Datos {
  url = 'http://localhost/moderni/'

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
}