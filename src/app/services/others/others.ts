import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartConfirmationModal, CartItem } from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color } from '../../datos';

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

@Component({
  selector: 'app-others',
  imports: [CommonModule, FormsModule, CartConfirmationModal, ToastNotification],
  templateUrl: './others.html',
  styleUrl: './others.scss'
})
export class Others implements OnInit {
  // Modal state
  showModal = false;
  modalItem: CartItem | null = null;
  selectedProductColors: { [productId: number]: number } = {};
  
  // Toast notification state
  showToast = false;
  toastMessage = '';
  currentProductName = '';
  
  // Loading state
  isLoading = true;
  loadError = '';
  // Furniture categories for carousel
  categories: FurnitureCategory[] = [
    { id: 'all', name: 'All Products', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop' },
    { id: 'Chairs', name: 'Chairs', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=300&h=300&fit=crop' },
    { id: 'Tables', name: 'Tables', image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=300&h=300&fit=crop' },
    { id: 'Shelves', name: 'Shelves', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=300&h=300&fit=crop' },
    { id: 'Stools', name: 'Stools', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop' },
    { id: 'Benches', name: 'Benches', image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=300&h=300&fit=crop' },
    { id: 'Organizers', name: 'Organizers', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=300&h=300&fit=crop' },
    { id: 'Mirrors', name: 'Mirrors', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=300&h=300&fit=crop' }
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

  constructor(private datosService: Datos) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.loadError = '';
    
    this.datosService.getIndividualProducts().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        // Map API products to component Product interface
        this.allProducts = apiProducts.map(ap => ({
          id: ap.id,
          name: ap.name,
          collection: ap.collection,
          description: ap.description,
          price: ap.price,
          oldPrice: ap.oldPrice,
          category: ap.category,
          colors: ap.colors,
          image: ap.image,
          inStock: ap.inStock
        }));
        
        this.isLoading = false;
        this.extractFilters();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loadError = 'Failed to load products. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  extractFilters() {
    const colorSet = new Set<string>();
    this.allProducts.forEach(product => {
      product.colors.forEach(color => colorSet.add(color.name));
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
      products = products.filter(p => p.category === this.selectedCategory);
    }

    // Filter by price
    products = products.filter(p => p.price >= this.currentMinPrice && p.price <= this.currentMaxPrice);

    // Filter by colors
    if (this.selectedColors.length > 0) {
      products = products.filter(p => 
        p.colors.some(c => this.selectedColors.includes(c.name))
      );
    }

    // Filter by stock
    if (this.onlyInStock) {
      products = products.filter(p => p.inStock);
    }

    // Sort products
    this.sortProducts(products);

    this.filteredProducts = products;
  }

  sortProducts(products: Product[]) {
    switch(this.sortBy) {
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
    const selectedColor = product.colors[colorIndex];
    
    this.modalItem = {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      selectedColor: {
        name: selectedColor.name,
        code: selectedColor.code
      }
    };
    
    this.showModal = true;
  }

  confirmAddToCart(): void {
    if (this.modalItem) {
      this.currentProductName = this.modalItem.name;
      console.log('Adding to cart:', this.modalItem);
      // TODO: Implement actual cart functionality
      
      // Close modal first
      this.closeModal();
      
      // Show success toast
      this.toastMessage = `${this.currentProductName} has been added to cart successfully!`;
      this.showToast = true;
      
      // Reset toast after it's shown
      setTimeout(() => {
        this.showToast = false;
      }, 3500);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.modalItem = null;
  }

  addToCart(product: Product) {
    this.openCartModal(product);
  }
}
