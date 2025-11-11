import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  CartConfirmationModal,
  CartItem,
} from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color } from '../../datos';
import { CartService } from '../../shared/cart.service';
import { Router } from '@angular/router';
import { FavoriteToggleComponent } from '../../shared/favorite-toggle/favorite-toggle';

interface FurnitureCategory {
  id: string;
  name: string;
  image: string;
}

interface Product {
  id: number;
  name: string;
  collection?: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  colors: Color[];
  image: string;
  inStock: boolean;
}

type ModalCartItem = CartItem & {
  id?: number;
  dimensions?: {
    width?: string;
    height?: string;
    depth?: string;
  } | null;
};

@Component({
  selector: 'app-others',
  imports: [FormsModule, CartConfirmationModal, ToastNotification, FavoriteToggleComponent],
  templateUrl: './others.html',
  styleUrl: './others.scss',
})
export class Others implements OnInit {
  // Modal state
  showModal = false;
  modalItem: ModalCartItem | null = null;
  modalAdminMode = false;
  isAdmin = false;
  modalProductId: number | null = null;
  selectedProductColors: { [productId: number]: number } = {};

  // Toast notification state
  showToast = false;
  toastMessage = '';
  currentProductName = '';

  // Loading state
  isLoading = true;
  loadError = '';

  // --- borrar producto (admin) ---
  showDeleteConfirm = false;
  productToDelete: number | null = null;

  // Furniture categories for carousel
  categories: FurnitureCategory[] = [
    {
      id: 'all',
      name: 'All Products',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
    },
    {
      id: 'Chairs',
      name: 'Chairs',
      image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=300&h=300&fit=crop',
    },
    {
      id: 'Tables',
      name: 'Tables',
      image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=300&h=300&fit=crop',
    },
    {
      id: 'Shelves',
      name: 'Shelves',
      image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=300&h=300&fit=crop',
    },
    {
      id: 'Stools',
      name: 'Stools',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    },
    {
      id: 'Benches',
      name: 'Benches',
      image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=300&h=300&fit=crop',
    },
    {
      id: 'Organizers',
      name: 'Organizers',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=300&h=300&fit=crop',
    },
    {
      id: 'Mirrors',
      name: 'Mirrors',
      image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=300&h=300&fit=crop',
    },
  ];

  // All products (loaded from API)
  allProducts: Product[] = [];

  // Filtered products
  filteredProducts: Product[] = [];

  // Selected filters
  selectedCategory: string = 'all';
  selectedColors: string[] = [];
  minPrice: number = 0;
  maxPrice: number = 500;
  currentMinPrice: number = 0;
  currentMaxPrice: number = 500;
  onlyInStock: boolean = false;
  sortBy: string = 'popular';
  showFilters: boolean = false;

  // Available filter options
  allColors: string[] = [];

  constructor(
    private datosService: Datos,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.datosService.getLoggedUser().subscribe({
      next: (u: any) => {
        const role = u && u.rol ? u.rol : u && u.role ? u.role : null;
        this.isAdmin = role && (role === 'admin' || role === 'carpintero' || role === 'superadmin');
      },
      error: () => {
        this.isAdmin = false;
      },
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.loadError = '';

    this.datosService.getIndividualProducts().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        // Map API products to component Product interface
        this.allProducts = apiProducts.map((ap) => ({
          id: ap.id,
          name: ap.name,
          collection: ap.collection,
          description: ap.description,
          price: ap.price,
          oldPrice: ap.oldPrice,
          category: ap.category,
          colors: ap.colors,
          image: ap.image,
          inStock: ap.inStock,
        }));

        this.isLoading = false;
        this.extractFilters();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loadError = 'Failed to load products. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  extractFilters() {
    const colorSet = new Set<string>();
    this.allProducts.forEach((product) => {
      product.colors.forEach((color) => colorSet.add(color.name));
    });
    this.allColors = Array.from(colorSet).sort();
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  toggleColor(color: string) {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push(color);
    }
    this.applyFilters();
  }

  isColorSelected(color: string): boolean {
    return this.selectedColors.includes(color);
  }

  applyFilters() {
    let products = [...this.allProducts];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      products = products.filter((p) => p.category === this.selectedCategory);
    }

    // Filter by price
    products = products.filter(
      (p) => p.price >= this.currentMinPrice && p.price <= this.currentMaxPrice
    );

    // Filter by colors
    if (this.selectedColors.length > 0) {
      products = products.filter((p) => p.colors.some((c) => this.selectedColors.includes(c.name)));
    }

    // Filter by stock
    if (this.onlyInStock) {
      products = products.filter((p) => p.inStock);
    }

    // Sort products
    this.sortProducts(products);

    this.filteredProducts = products;
  }

  sortProducts(products: Product[]) {
    switch (this.sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // popular - keep original order
        break;
    }
  }

  clearFilters() {
    this.selectedCategory = 'all';
    this.selectedColors = [];
    this.currentMinPrice = this.minPrice;
    this.currentMaxPrice = this.maxPrice;
    this.onlyInStock = false;
    this.sortBy = 'popular';
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCategory !== 'all') count++;
    count += this.selectedColors.length;
    if (this.currentMinPrice !== this.minPrice || this.currentMaxPrice !== this.maxPrice) count++;
    if (this.onlyInStock) count++;
    return count;
  }

  selectColor(productId: number, colorIndex: number): void {
    this.selectedProductColors[productId] = colorIndex;
  }

  openCartModal(product: Product): void {
    if (!product.inStock) return;

    // Get selected color or default to first color
    const colorIndex = this.selectedProductColors[product.id] ?? 0;
    const selectedColor = product.colors?.[colorIndex] ||
      product.colors?.[0] || { name: 'Default', code: '#000000' };

    this.modalProductId = product.id;
    this.modalItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      selectedColor: {
        name: selectedColor.name,
        code: selectedColor.code,
      },
      dimensions: (product as any).dimensions ?? null,
    };
    this.modalAdminMode = this.isAdmin;
    this.showModal = true;
  }

  confirmAddToCart(): void {
    if (this.modalItem) {
      this.currentProductName = this.modalItem.name;
      console.log('Adding to cart:', this.modalItem);
      this.datosService.getLoggedUser().subscribe({
        next: (user) => {
          const isLogged = user && user.email;
          if (isLogged) {
            this.cartService.addItem({
              name: this.modalItem!.name,
              description: this.modalItem!.description,
              price: this.modalItem!.price,
              image: this.modalItem!.image,
              selectedColor: this.modalItem!.selectedColor,
              dimensions: (this.modalItem as any).dimensions || null,
            });
            this.closeModal();
            this.toastMessage = `${this.currentProductName} has been added to cart successfully!`;
            this.showToast = true;
            setTimeout(() => {
              this.showToast = false;
            }, 3500);
          } else {
            this.closeModal();
            alert('You must be logged in to add items to the cart. Please log in first.');
            try {
              this.router.navigate(['/login']);
            } catch (e) {}
          }
        },
        error: () => {
          try {
            const raw = localStorage.getItem('loggedUser');
            if (raw) {
              this.cartService.addItem({
                name: this.modalItem!.name,
                description: this.modalItem!.description,
                price: this.modalItem!.price,
                image: this.modalItem!.image,
                selectedColor: this.modalItem!.selectedColor,
                dimensions: (this.modalItem as any).dimensions || null,
              });
              this.closeModal();
              this.toastMessage = `${this.currentProductName} has been added to cart successfully!`;
              this.showToast = true;
              setTimeout(() => {
                this.showToast = false;
              }, 3500);
              return;
            }
          } catch (e) {
            /* ignore */
          }
          this.closeModal();
          alert('You must be logged in to add items to the cart. Please log in first.');
          try {
            this.router.navigate(['/login']);
          } catch (e) {}
        },
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.modalItem = null;
    this.modalProductId = null;
  }

  saveModified(edited: any) {
    if (!edited) return;

    this.modalItem = { ...(this.modalItem ?? {}), ...edited } as ModalCartItem;
    this.showModal = false;

    const targetId = this.modalProductId;
    if (targetId == null) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
      return;
    }

    const idx = this.allProducts.findIndex((p) => p.id === targetId);
    if (idx === -1) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
      return;
    }

    const current = this.allProducts[idx];
    let updatedPrice = current.price;
    if (edited.price !== undefined && edited.price !== null && edited.price !== '') {
      const parsedPrice = Number(edited.price);
      if (!Number.isNaN(parsedPrice)) {
        updatedPrice = parsedPrice;
      }
    }
    if (this.modalItem) {
      this.modalItem.price = updatedPrice;
    }
    const updatedProduct: Product = {
      ...current,
      name: edited.name ?? current.name,
      price: updatedPrice,
      image: edited.image ?? current.image,
    };
    this.allProducts[idx] = updatedProduct;
    this.applyFilters();

    const payload: any = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      price: updatedProduct.price,
      image: updatedProduct.image,
    };

    if (edited.dimensions) {
      payload.dimensions = edited.dimensions;
    }

    console.log('Others.saveModified: calling updateProduct with payload', payload);
    this.datosService.updateProduct(payload).subscribe({
      next: () => {
        this.toastMessage = 'Cambios guardados en el servidor.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 2000);
      },
      error: (err) => {
        console.error('Error updating product', err);
        this.toastMessage = 'Error guardando en el servidor. Los cambios quedaron locales.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 4000);
      },
    });
  }

  addToCart(product: Product) {
    this.openCartModal(product);
  }

  confirmDeleteProduct(productId: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.productToDelete = productId;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.productToDelete = null;
  }

  executeDelete() {
    if (!this.productToDelete) return;
    this.datosService.deleteProduct(this.productToDelete).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.productToDelete = null;
        this.toastMessage = 'Producto eliminado correctamente.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 2000);
        this.loadProducts(); // << recarga others
      },
      error: (err) => {
        console.error('Error eliminando producto', err);
        this.toastMessage = 'Error eliminando el producto.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 4000);
      },
    });
  }
}
