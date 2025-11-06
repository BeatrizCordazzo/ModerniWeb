import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartConfirmationModal, CartItem } from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { CustomOrderConfirmationModal } from '../../shared/custom-order-confirmation-modal/custom-order-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color } from '../../datos';
import { CartService } from '../../shared/cart.service';
import { Router } from '@angular/router';
import { FavoriteToggleComponent } from '../../shared/favorite-toggle/favorite-toggle';

interface KitchenSet {
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

type ModalCartItem = CartItem & {
  id?: number;
  dimensions?: {
    width?: string;
    height?: string;
    depth?: string;
  } | null;
};

@Component({
  selector: 'app-kitchen',
  imports: [CommonModule, FormsModule, CartConfirmationModal, ToastNotification, CustomOrderConfirmationModal, FavoriteToggleComponent],
  templateUrl: './kitchen.html',
  styleUrl: './kitchen.scss'
})
export class Kitchen implements OnInit {
  // Modal state
  showModal = false;
  modalAdminMode = false;
  isAdmin = false;
  modalItem: ModalCartItem | null = null;
  modalProductId: number | null = null;
  
  // Toast notification state
  showToast = false;
  toastMessage = '';
  currentProductName = '';
  // Custom order modal state
  showCustomModal = false;
  customOrderData: any = null;
  
  // Loading state
  isLoading = true;
  loadError = '';
  
  // Pre-designed kitchen sets (loaded from API)
  kitchenSets: KitchenSet[] = [];

  constructor(private datosService: Datos, private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.loadKitchenSets();
    this.datosService.getLoggedUser().subscribe({
      next: (u: any) => {
        const role = u && u.rol ? u.rol : (u && u.role ? u.role : null);
        this.isAdmin = role && (role === 'admin' || role === 'carpintero' || role === 'superadmin');
      },
      error: () => { this.isAdmin = false; }
    });
    // Listen for product updates from the Datos service and update local list if needed
    this.datosService.productUpdated$.subscribe((prod: any) => {
      if (!prod || !prod.id) return;
      const idx = this.kitchenSets.findIndex(s => s.id === prod.id);
      if (idx !== -1) {
        this.kitchenSets[idx] = {
          ...this.kitchenSets[idx],
          name: prod.name ?? this.kitchenSets[idx].name,
          basePrice: prod.price ?? this.kitchenSets[idx].basePrice,
          image: prod.image ?? this.kitchenSets[idx].image,
          dimensions: prod.dimensions ?? this.kitchenSets[idx].dimensions
        };
        if (this.selectedSet && this.selectedSet.id === prod.id) this.selectedSet = this.kitchenSets[idx];
      }
    });
  }

  loadKitchenSets() {
    this.isLoading = true;
    this.loadError = '';
    
    this.datosService.getKitchenSets().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        // Map API products to KitchenSet interface
        this.kitchenSets = apiProducts.map((ap, index) => ({
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
        console.error('Error loading kitchen sets:', error);
        this.loadError = 'Failed to load kitchen sets. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // Custom furniture options for "Make it your own"
  customFurnitureOptions: CustomFurniture[] = [
    {
      id: 'base-cabinet',
      name: 'Base Cabinet',
      type: 'cabinet',
      basePrice: 299.95,
      image: 'https://images.unsplash.com/photo-1595514535116-02876df50c56?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 30,
        maxWidth: 120,
        minHeight: 70,
        maxHeight: 90,
        depth: 60
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Gray', code: '#808080' }
      ]
    },
    {
      id: 'upper-cabinet',
      name: 'Upper Cabinet',
      type: 'cabinet',
      basePrice: 249.95,
      image: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 30,
        maxWidth: 120,
        minHeight: 50,
        maxHeight: 90,
        depth: 35
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Gray', code: '#808080' }
      ]
    },
    {
      id: 'countertop',
      name: 'Countertop',
      type: 'surface',
      basePrice: 149.95,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 60,
        maxWidth: 300,
        minHeight: 3,
        maxHeight: 5,
        depth: 60
      },
      availableColors: [
        { name: 'Granite Black', code: '#1C1C1C' },
        { name: 'Marble White', code: '#F5F5F5' },
        { name: 'Quartz Gray', code: '#808080' },
        { name: 'Butcher Block', code: '#D2691E' }
      ]
    },
    {
      id: 'island',
      name: 'Kitchen Island',
      type: 'furniture',
      basePrice: 899.95,
      image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 100,
        maxWidth: 200,
        minHeight: 85,
        maxHeight: 95,
        depth: 80
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Navy', code: '#001F3F' },
        { name: 'Gray', code: '#808080' }
      ]
    },
    {
      id: 'pantry',
      name: 'Tall Pantry',
      type: 'storage',
      basePrice: 599.95,
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 60,
        maxWidth: 100,
        minHeight: 200,
        maxHeight: 240,
        depth: 60
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Gray', code: '#808080' }
      ]
    },
    {
      id: 'open-shelving',
      name: 'Open Shelving Unit',
      type: 'storage',
      basePrice: 199.95,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 60,
        maxWidth: 150,
        minHeight: 30,
        maxHeight: 50,
        depth: 30
      },
      availableColors: [
        { name: 'Natural Wood', code: '#D2B48C' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black Metal', code: '#1C1C1C' },
        { name: 'Walnut', code: '#5C4033' }
      ]
    }
  ];

  // View state
  viewMode: 'sets' | 'custom' = 'sets';
  
  // Selected pre-designed set
  selectedSet: KitchenSet | null = null;
  selectedSetColor: Color | null = null;

  // Custom design state
  customSpaceWidth: number = 0;
  customSpaceHeight: number = 0;
  customSpaceDepth: number = 0;
  customSelections: CustomSelection[] = [];
  
  // UI state
  showColorPicker: boolean = false;
  showCustomForm: boolean = false;

  selectSet(set: KitchenSet) {
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
    this.showCustomForm = false;
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
      // human readable title to store as project/pedido name
      title: (() => {
        const names = this.customSelections.map(s => s.furniture.name).filter(Boolean);
        const setName = this.selectedSet?.name;
        const base = setName || (names.length ? names.slice(0,3).join(', ') : 'Pedido personalizado');
        return `Pedido personalizado - ${base}`;
      })(),
      type: 'custom-kitchen',
      spaceDimensions: {
        width: this.customSpaceWidth,
        height: this.customSpaceHeight,
        depth: this.customSpaceDepth
      },
      furniture: this.customSelections.map(sel => ({
        name: sel.furniture.name,
        type: sel.furniture.type,
        color: sel.selectedColor.name,
        image: sel.furniture.image || null,
        dimensions: {
          width: sel.customWidth,
          height: sel.customHeight,
          depth: sel.furniture.dimensions.depth
        },
        quantity: sel.quantity,
        price: this.calculateCustomPrice(sel)
      })),
      images: Array.from(new Set(this.customSelections.map(s => s.furniture.image).filter(Boolean))),
      totalPrice: this.getTotalCustomPrice(),
      timestamp: new Date().toISOString()
    };

    // Open confirmation modal with details
    this.customOrderData = orderData;
    this.showCustomModal = true;
  }

  confirmSendCustomOrder(): void {
    if (!this.customOrderData) return;
    console.log('Sending custom order to carpenters:', this.customOrderData);
    // Send to backend via Datos service so admin will see it as pending presupuesto
    this.datosService.createCustomOrder(this.customOrderData).subscribe({
      next: (res) => {
        this.toastMessage = `Custom kitchen order submitted! Total: €${this.customOrderData.totalPrice.toFixed(2)}`;
        this.showToast = true;
        setTimeout(() => { this.showToast = false; }, 3500);

        // reset form
        this.customSelections = [];
        this.customSpaceWidth = 0;
        this.customSpaceHeight = 0;
        this.customSpaceDepth = 0;

        this.closeCustomModal();
      },
      error: (err) => {
        console.error('Error submitting custom order', err);
        alert('Error enviando el pedido personalizado. Intenta de nuevo.');
      }
    });
  }

  closeCustomModal(): void {
    this.showCustomModal = false;
    this.customOrderData = null;
  }

  addSetToCart() {
    if (!this.selectedSet || !this.selectedSetColor) {
      alert('Please select a kitchen set and color.');
      return;
    }

    this.modalProductId = this.selectedSet.id;
    this.modalItem = {
      id: this.selectedSet.id,
      name: this.selectedSet.name,
      description: this.selectedSet.description,
      price: this.selectedSet.basePrice,
      image: this.selectedSet.image,
      selectedColor: {
        name: this.selectedSetColor.name,
        code: this.selectedSetColor.code
      },
      dimensions: this.selectedSet.dimensions ?? null
    };
    
    this.modalAdminMode = this.isAdmin;
    this.showModal = true;
  }

  quickAddToCart(set: KitchenSet) {
    // Add set to cart with default/first color
    const defaultColor = set.availableColors[0];
    
    this.modalProductId = set.id;
    this.modalItem = {
      id: set.id,
      name: set.name,
      description: set.description,
      price: set.basePrice,
      image: set.image,
      selectedColor: {
        name: defaultColor.name,
        code: defaultColor.code
      },
      dimensions: set.dimensions ?? null
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
              dimensions: this.selectedSet?.dimensions || (this.modalItem as any).dimensions || null
            });
            this.closeModal();
            this.toastMessage = `${this.currentProductName} has been added to cart successfully!`;
            this.showToast = true;
            setTimeout(() => { this.showToast = false; }, 3500);
          } else {
            this.closeModal();
            alert('You must be logged in to add items to the cart. Please log in first.');
            try { this.router.navigate(['/login']); } catch (e) {}
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
                dimensions: this.selectedSet?.dimensions || (this.modalItem as any).dimensions || null
              });
              this.closeModal();
              this.toastMessage = `${this.currentProductName} has been added to cart successfully!`;
              this.showToast = true;
              setTimeout(() => { this.showToast = false; }, 3500);
              return;
            }
          } catch (e) { /* ignore */ }
          this.closeModal();
          alert('You must be logged in to add items to the cart. Please log in first.');
          try { this.router.navigate(['/login']); } catch (e) {}
        }
      });
    }
  }

  saveModified(edited: any) {
    if (!edited) return;
    this.modalItem = { ...(this.modalItem ?? {}), ...edited } as ModalCartItem;
    this.showModal = false;

    const targetId = this.modalProductId ?? (this.selectedSet ? this.selectedSet.id : null);
    if (targetId == null) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => { this.showToast = false; }, 1500);
      return;
    }

    const idx = this.kitchenSets.findIndex(s => s.id === targetId);
    if (idx === -1) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => { this.showToast = false; }, 1500);
      return;
    }

    const currentSet = this.kitchenSets[idx];
    let updatedPrice = currentSet.basePrice;
    if (edited.price !== undefined && edited.price !== null && edited.price !== '') {
      const parsedPrice = Number(edited.price);
      if (!Number.isNaN(parsedPrice)) {
        updatedPrice = parsedPrice;
      }
    }
    if (this.modalItem) {
      this.modalItem.price = updatedPrice;
    }

    const updatedDimensions = edited.dimensions ?? currentSet.dimensions;
    const updatedSet: KitchenSet = {
      ...currentSet,
      name: edited.name ?? currentSet.name,
      basePrice: updatedPrice,
      image: edited.image ?? currentSet.image,
      dimensions: updatedDimensions
    };
    this.kitchenSets[idx] = updatedSet;
    if (this.selectedSet && this.selectedSet.id === targetId) {
      this.selectedSet = updatedSet;
    }

    const payload: any = {
      id: targetId,
      name: updatedSet.name,
      price: updatedSet.basePrice,
      image: updatedSet.image
    };
    if (updatedDimensions) {
      payload.dimensions = updatedDimensions;
    }
    console.log('Kitchen.saveModified: calling updateProduct with payload', payload);
    this.datosService.updateProduct(payload).subscribe({
      next: () => {
        this.toastMessage = 'Cambios guardados en el servidor.';
        this.showToast = true;
        setTimeout(() => { this.showToast = false; }, 2000);
      },
      error: (err) => {
        console.error('Error updating product', err);
        this.toastMessage = 'Error guardando en el servidor. Los cambios quedaron locales.';
        this.showToast = true;
        setTimeout(() => { this.showToast = false; }, 4000);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.modalItem = null;
    this.modalProductId = null;
  }
}
