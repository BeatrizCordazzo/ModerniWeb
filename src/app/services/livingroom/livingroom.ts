import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartConfirmationModal, CartItem } from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { CustomOrderConfirmationModal } from '../../shared/custom-order-confirmation-modal/custom-order-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color } from '../../datos';
import { CartService } from '../../shared/cart.service';
import { Router } from '@angular/router';

interface LivingRoomSet {
  id: number;
  name: string;
  style?: string;
  description: string;
  basePrice: number;
  image: string;
  includes?: string[];
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
  selector: 'app-livingroom',
  imports: [CommonModule, FormsModule, CartConfirmationModal, ToastNotification, CustomOrderConfirmationModal],
  templateUrl: './livingroom.html',
  styleUrl: './livingroom.scss'
})
export class Livingroom implements OnInit {
  // Modal state
  showModal = false;
  modalAdminMode = false;
  isAdmin = false;
  showAdminConfirm = false;
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
  
  livingRoomSets: LivingRoomSet[] = [];

  constructor(private datosService: Datos, private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.loadLivingRoomSets();
    // detect admin role to change UI for admins
    this.datosService.getLoggedUser().subscribe({
      next: (u: any) => {
        const role = u && u.rol ? u.rol : (u && u.role ? u.role : null);
        this.isAdmin = role && (role === 'admin' || role === 'carpintero' || role === 'superadmin');
      },
      error: () => { this.isAdmin = false; }
    });
    // Sync local livingRoomSets when a product is updated elsewhere
    this.datosService.productUpdated$.subscribe((prod: any) => {
      if (!prod || !prod.id) return;
      const idx = this.livingRoomSets.findIndex(s => s.id === prod.id);
      if (idx !== -1) {
        this.livingRoomSets[idx] = {
          ...this.livingRoomSets[idx],
          name: prod.name ?? this.livingRoomSets[idx].name,
          basePrice: prod.price ?? this.livingRoomSets[idx].basePrice,
          image: prod.image ?? this.livingRoomSets[idx].image,
          dimensions: prod.dimensions ?? this.livingRoomSets[idx].dimensions
        };
        if (this.selectedSet && this.selectedSet.id === prod.id) this.selectedSet = this.livingRoomSets[idx];
      }
    });
  }

  loadLivingRoomSets() {
    this.isLoading = true;
    this.loadError = '';
    
    this.datosService.getLivingRoomSets().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        this.livingRoomSets = apiProducts.map(ap => ({
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
        console.error('Error loading living room sets:', error);
        this.loadError = 'Failed to load living room sets. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  customFurnitureOptions: CustomFurniture[] = [
    {
      id: 'sofa',
      name: 'Sofa',
      type: 'seating',
      basePrice: 1299.95,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 180,
        maxWidth: 280,
        minHeight: 80,
        maxHeight: 100,
        depth: 90
      },
      availableColors: [
        { name: 'Gray', code: '#808080' },
        { name: 'Beige', code: '#F5F5DC' },
        { name: 'Navy', code: '#000080' },
        { name: 'Charcoal', code: '#36454F' }
      ]
    },
    {
      id: 'coffee-table',
      name: 'Coffee Table',
      type: 'table',
      basePrice: 399.95,
      image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 100,
        maxWidth: 150,
        minHeight: 40,
        maxHeight: 50,
        depth: 60
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#000000' }
      ]
    },
    {
      id: 'tv-unit',
      name: 'TV Entertainment Unit',
      type: 'storage',
      basePrice: 899.95,
      image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 150,
        maxWidth: 250,
        minHeight: 50,
        maxHeight: 70,
        depth: 45
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White Gloss', code: '#FFFFFF' },
        { name: 'Gray', code: '#808080' }
      ]
    },
    {
      id: 'bookshelf',
      name: 'Bookshelf',
      type: 'storage',
      basePrice: 699.95,
      image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 80,
        maxWidth: 180,
        minHeight: 180,
        maxHeight: 240,
        depth: 35
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#000000' }
      ]
    },
    {
      id: 'side-table',
      name: 'Side Table',
      type: 'table',
      basePrice: 249.95,
      image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 40,
        maxWidth: 60,
        minHeight: 50,
        maxHeight: 65,
        depth: 40
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Marble Top', code: '#E8F4F8' }
      ]
    },
    {
      id: 'accent-chair',
      name: 'Accent Chair',
      type: 'seating',
      basePrice: 549.95,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 60,
        maxWidth: 80,
        minHeight: 80,
        maxHeight: 100,
        depth: 70
      },
      availableColors: [
        { name: 'Velvet Blue', code: '#4169E1' },
        { name: 'Gray Fabric', code: '#A9A9A9' },
        { name: 'Beige Linen', code: '#F5F5DC' },
        { name: 'Emerald Green', code: '#50C878' }
      ]
    }
  ];

  viewMode: 'sets' | 'custom' = 'sets';
  selectedSet: LivingRoomSet | null = null;
  selectedSetColor: Color | null = null;
  customSpaceWidth: number = 0;
  customSpaceHeight: number = 0;
  customSpaceDepth: number = 0;
  customSelections: CustomSelection[] = [];
  showColorPicker: boolean = false;

  selectSet(set: LivingRoomSet) {
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
      // human readable title to store as project/pedido name
      title: (() => {
        const names = this.customSelections.map(s => s.furniture.name).filter(Boolean);
        const setName = this.selectedSet?.name;
        const base = setName || (names.length ? names.slice(0,3).join(', ') : 'Pedido personalizado');
        return `Pedido personalizado - ${base}`;
      })(),
      type: 'custom-livingroom',
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

    // open confirmation modal with order details
    this.customOrderData = orderData;
    this.showCustomModal = true;
  }

  confirmSendCustomOrder(): void {
    if (!this.customOrderData) return;
    console.log('Sending custom order to carpenters:', this.customOrderData);
    // Send to backend via Datos service so admin will see it as a pending custom order
    this.datosService.createCustomOrder(this.customOrderData).subscribe({
      next: (res: any) => {
        this.toastMessage = `Custom living room order submitted! Total: €${this.customOrderData.totalPrice.toFixed(2)}`;
        this.showToast = true;
        setTimeout(() => { this.showToast = false; }, 3500);

        // reset form
        this.customSelections = [];
        this.customSpaceWidth = 0;
        this.customSpaceHeight = 0;
        this.customSpaceDepth = 0;

        this.closeCustomModal();
      },
      error: (err: any) => {
        console.error('Error submitting custom living room order', err);
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
      alert('Please select a living room set and color.');
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

  quickAddToCart(set: LivingRoomSet) {
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
      // Check if user is logged in
      this.datosService.getLoggedUser().subscribe({
        next: (user) => {
          const isLogged = user && user.email;
          if (isLogged) {
            // Add to cart via service
            this.cartService.addItem({
                name: this.modalItem!.name,
                description: this.modalItem!.description,
                price: this.modalItem!.price,
                image: this.modalItem!.image,
                selectedColor: this.modalItem!.selectedColor,
                // include set dimensions so checkout can forward them to the server
                dimensions: this.selectedSet?.dimensions || (this.modalItem as any).dimensions || null
            });

            // Close modal and show toast
            this.closeModal();
            this.toastMessage = `${this.currentProductName} has been added to cart successfully!`;
            this.showToast = true;
            setTimeout(() => { this.showToast = false; }, 3500);
          } else {
            // Not logged - prompt to login
            this.closeModal();
            alert('You must be logged in to add items to the cart. Please log in first.');
            try {
              this.router.navigate(['/login']);
            } catch (e) {
              // ignore navigation errors
            }
          }
        },
        error: () => {
          // Try fallback to localStorage
          try {
            const raw = localStorage.getItem('loggedUser');
            if (raw) {
              // treat as logged
              this.cartService.addItem({
                name: this.modalItem!.name,
                description: this.modalItem!.description,
                price: this.modalItem!.price,
                image: this.modalItem!.image,
                selectedColor: this.modalItem!.selectedColor
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

  // Called when admin saves modifications from the modal
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

    const idx = this.livingRoomSets.findIndex(s => s.id === targetId);
    if (idx === -1) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => { this.showToast = false; }, 1500);
      return;
    }

    const currentSet = this.livingRoomSets[idx];
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
    const updatedSet: LivingRoomSet = {
      ...currentSet,
      name: edited.name ?? currentSet.name,
      basePrice: updatedPrice,
      image: edited.image ?? currentSet.image,
      dimensions: updatedDimensions
    };
    this.livingRoomSets[idx] = updatedSet;
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
    console.log('Livingroom.saveModified: calling updateProduct with payload', payload);

    this.datosService.updateProduct(payload).subscribe({
      next: () => {
        this.toastMessage = 'Cambios guardados en el servidor.';
        this.showToast = true;
        setTimeout(() => { this.showToast = false; }, 2000);
      },
      error: (err) => {
        console.error('Error saving product changes to server', err);
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
