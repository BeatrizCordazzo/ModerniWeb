import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartConfirmationModal, CartItem } from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color } from '../../datos';

interface BedroomSet {
  id: number;
  name: string;
  style: string;
  description: string;
  basePrice: number;
  image: string;
  includes: string[];
  dimensions: {
    width: string;
    height: string;
    depth: string;
  };
  availableColors: Color[];
}

interface CustomFurniture {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  image: string;
  dimensions: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    depth: number;
  };
  availableColors: Color[];
}

interface CustomSelection {
  furniture: CustomFurniture;
  selectedColor: Color;
  customWidth: number;
  customHeight: number;
  quantity: number;
}

@Component({
  selector: 'app-bedroom',
  imports: [CommonModule, FormsModule, CartConfirmationModal, ToastNotification],
  templateUrl: './bedroom.html',
  styleUrl: './bedroom.scss'
})
export class Bedroom implements OnInit {
  // Modal state
  showModal = false;
  modalItem: CartItem | null = null;
  
  // Toast notification state
  showToast = false;
  toastMessage = '';
  currentProductName = '';
  
  // Loading state
  isLoading = true;
  loadError = '';
  
  bedroomSets: BedroomSet[] = [];

  constructor(private datosService: Datos) {}

  ngOnInit() {
    this.loadBedroomSets();
  }

  loadBedroomSets() {
    this.isLoading = true;
    this.loadError = '';
    
    this.datosService.getBedroomSets().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        this.bedroomSets = apiProducts.map(ap => ({
          id: ap.id,
          name: ap.name,
          style: ap.style || '',
          description: ap.description,
          basePrice: ap.price,
          image: ap.image,
          includes: ap.includes || [],
          dimensions: {
            width: ap.dimensions?.width || '',
            height: ap.dimensions?.height || '',
            depth: ap.dimensions?.depth || ''
          },
          availableColors: ap.colors
        }));
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bedroom sets:', error);
        this.loadError = 'Failed to load bedroom sets. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  customFurnitureOptions: CustomFurniture[] = [
    {
      id: 'bed-frame',
      name: 'Bed Frame',
      type: 'furniture',
      basePrice: 899.95,
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 140,
        maxWidth: 200,
        minHeight: 40,
        maxHeight: 150,
        depth: 210
      },
      availableColors: [
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Walnut', code: '#5C4033' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Gray', code: '#808080' }
      ]
    },
    {
      id: 'nightstand',
      name: 'Nightstand',
      type: 'furniture',
      basePrice: 249.95,
      image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 40,
        maxWidth: 60,
        minHeight: 50,
        maxHeight: 70,
        depth: 40
      },
      availableColors: [
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Walnut', code: '#5C4033' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#000000' }
      ]
    },
    {
      id: 'dresser',
      name: 'Dresser',
      type: 'storage',
      basePrice: 699.95,
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 100,
        maxWidth: 180,
        minHeight: 80,
        maxHeight: 120,
        depth: 50
      },
      availableColors: [
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Walnut', code: '#5C4033' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Gray', code: '#808080' }
      ]
    },
    {
      id: 'wardrobe',
      name: 'Wardrobe',
      type: 'storage',
      basePrice: 1299.95,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 100,
        maxWidth: 250,
        minHeight: 180,
        maxHeight: 240,
        depth: 60
      },
      availableColors: [
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Walnut', code: '#5C4033' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Mirrored', code: '#E8F4F8' }
      ]
    },
    {
      id: 'bench',
      name: 'Bedroom Bench',
      type: 'furniture',
      basePrice: 349.95,
      image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 100,
        maxWidth: 150,
        minHeight: 40,
        maxHeight: 50,
        depth: 40
      },
      availableColors: [
        { name: 'Fabric Gray', code: '#A9A9A9' },
        { name: 'Fabric Beige', code: '#F5F5DC' },
        { name: 'Leather Brown', code: '#654321' },
        { name: 'Velvet Navy', code: '#001F3F' }
      ]
    },
    {
      id: 'vanity',
      name: 'Vanity Table',
      type: 'furniture',
      basePrice: 499.95,
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 80,
        maxWidth: 120,
        minHeight: 75,
        maxHeight: 80,
        depth: 45
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Gold Accent', code: '#FFD700' },
        { name: 'Black', code: '#000000' }
      ]
    }
  ];

  viewMode: 'sets' | 'custom' = 'sets';
  selectedSet: BedroomSet | null = null;
  selectedSetColor: Color | null = null;
  customSpaceWidth: number = 0;
  customSpaceHeight: number = 0;
  customSpaceDepth: number = 0;
  customSelections: CustomSelection[] = [];
  showColorPicker: boolean = false;

  selectSet(set: BedroomSet) {
    this.selectedSet = set;
    this.selectedSetColor = set.availableColors[0];
    this.showColorPicker = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectSetColor(color: Color) {
    this.selectedSetColor = color;
  }

  switchToCustom() {
    this.viewMode = 'custom';
    this.selectedSet = null;
    this.showColorPicker = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchToSets() {
    this.viewMode = 'sets';
  }

  addCustomFurniture(furniture: CustomFurniture) {
    const selection: CustomSelection = {
      furniture: furniture,
      selectedColor: furniture.availableColors[0],
      customWidth: furniture.dimensions.minWidth,
      customHeight: furniture.dimensions.minHeight,
      quantity: 1
    };
    this.customSelections.push(selection);
  }

  removeCustomSelection(index: number) {
    this.customSelections.splice(index, 1);
  }

  calculateCustomPrice(selection: CustomSelection): number {
    const basePrice = selection.furniture.basePrice;
    const widthFactor = selection.customWidth / selection.furniture.dimensions.minWidth;
    const heightFactor = selection.customHeight / selection.furniture.dimensions.minHeight;
    const sizeFactor = (widthFactor + heightFactor) / 2;
    return basePrice * sizeFactor * selection.quantity;
  }

  getTotalCustomPrice(): number {
    return this.customSelections.reduce((total, selection) => {
      return total + this.calculateCustomPrice(selection);
    }, 0);
  }

  isCustomSpaceValid(): boolean {
    return this.customSpaceWidth > 0 && 
           this.customSpaceHeight > 0 && 
           this.customSpaceDepth > 0;
  }

  sendCustomOrderToCarpenters() {
    if (!this.isCustomSpaceValid() || this.customSelections.length === 0) {
      alert('Please enter space dimensions and select at least one furniture item.');
      return;
    }

    const orderData = {
      type: 'custom-bedroom',
      spaceDimensions: {
        width: this.customSpaceWidth,
        height: this.customSpaceHeight,
        depth: this.customSpaceDepth
      },
      furniture: this.customSelections.map(sel => ({
        name: sel.furniture.name,
        type: sel.furniture.type,
        color: sel.selectedColor.name,
        dimensions: {
          width: sel.customWidth,
          height: sel.customHeight,
          depth: sel.furniture.dimensions.depth
        },
        quantity: sel.quantity,
        price: this.calculateCustomPrice(sel)
      })),
      totalPrice: this.getTotalCustomPrice(),
      timestamp: new Date().toISOString()
    };

    console.log('Sending custom order to carpenters:', orderData);
    alert(`Custom bedroom order sent to our carpenters!\n\nTotal: $${this.getTotalCustomPrice().toFixed(2)}\n\nOur team will contact you within 24 hours.`);
    
    this.customSelections = [];
    this.customSpaceWidth = 0;
    this.customSpaceHeight = 0;
    this.customSpaceDepth = 0;
  }

  addSetToCart() {
    if (!this.selectedSet || !this.selectedSetColor) {
      alert('Please select a bedroom set and color.');
      return;
    }

    this.modalItem = {
      name: this.selectedSet.name,
      description: this.selectedSet.description,
      price: this.selectedSet.basePrice,
      image: this.selectedSet.image,
      selectedColor: {
        name: this.selectedSetColor.name,
        code: this.selectedSetColor.code
      }
    };
    
    this.showModal = true;
  }

  quickAddToCart(set: BedroomSet) {
    // Add set to cart with default/first color
    const defaultColor = set.availableColors[0];
    
    this.modalItem = {
      name: set.name,
      description: set.description,
      price: set.basePrice,
      image: set.image,
      selectedColor: {
        name: defaultColor.name,
        code: defaultColor.code
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
}
