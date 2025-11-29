import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CartConfirmationModal, CartItem } from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { CustomOrderConfirmationModal } from '../../shared/custom-order-confirmation-modal/custom-order-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color, CustomFurnitureOptionPayload } from '../../datos';
import { CartService } from '../../shared/cart.service';
import { LoginRequiredModalService } from '../../shared/login-required-modal/login-required-modal.service';
import { Router } from '@angular/router';
import { FavoriteToggleComponent } from '../../shared/favorite-toggle/favorite-toggle';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';

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
  id: number;
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

interface NewFurnitureForm {
  name: string;
  type: string;
  basePrice: number | null;
  image: string;
  minWidth: number | null;
  maxWidth: number | null;
  minHeight: number | null;
  maxHeight: number | null;
  depth: number | null;
  colors: string;
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
  imports: [
    FormsModule,
    CartConfirmationModal,
    ToastNotification,
    CustomOrderConfirmationModal,
    FavoriteToggleComponent,
    ConfirmationModal,
  ],
  templateUrl: './livingroom.html',
  styleUrl: './livingroom.scss',
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
  customFurnitureOptions: CustomFurniture[] = [];
  isLoadingCustomFurniture = false;
  customFurnitureError = '';
  newFurnitureForm: NewFurnitureForm = this.createEmptyFurnitureForm();
  editingCustomFurnitureOption: CustomFurniture | null = null;
  showFurnitureConfirm = false;
  furnitureConfirmTitle = '';
  furnitureConfirmMessage = '';
  furnitureConfirmAction: 'add' | 'delete' | null = null;
  pendingFurniturePayload: CustomFurnitureOptionPayload | null = null;
  pendingFurnitureId: number | null = null;
  optionPendingDelete: CustomFurniture | null = null;
  isProcessingFurniture = false;

  // --- borrar producto (admin) ---
  showDeleteConfirm = false;
  productToDelete: number | null = null;
  private readonly fallbackFurnitureOptions: CustomFurniture[] = [
    {
      id: 3001,
      name: 'Sofa',
      type: 'seating',
      basePrice: 1299.95,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 180,
        maxWidth: 280,
        minHeight: 80,
        maxHeight: 100,
        depth: 90,
      },
      availableColors: [
        { name: 'Gray', code: '#808080' },
        { name: 'Beige', code: '#F5F5DC' },
        { name: 'Navy', code: '#000080' },
        { name: 'Charcoal', code: '#36454F' },
      ],
    },
    {
      id: 3002,
      name: 'Coffee Table',
      type: 'table',
      basePrice: 399.95,
      image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 100,
        maxWidth: 150,
        minHeight: 40,
        maxHeight: 50,
        depth: 60,
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#000000' },
      ],
    },
    {
      id: 3003,
      name: 'TV Entertainment Unit',
      type: 'storage',
      basePrice: 899.95,
      image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 150,
        maxWidth: 250,
        minHeight: 50,
        maxHeight: 70,
        depth: 45,
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White Gloss', code: '#FFFFFF' },
        { name: 'Gray', code: '#808080' },
      ],
    },
    {
      id: 3004,
      name: 'Bookshelf',
      type: 'storage',
      basePrice: 699.95,
      image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 80,
        maxWidth: 180,
        minHeight: 180,
        maxHeight: 240,
        depth: 35,
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Black', code: '#000000' },
      ],
    },
    {
      id: 3005,
      name: 'Side Table',
      type: 'table',
      basePrice: 249.95,
      image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 40,
        maxWidth: 60,
        minHeight: 50,
        maxHeight: 65,
        depth: 40,
      },
      availableColors: [
        { name: 'Walnut', code: '#5C4033' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Marble Top', code: '#E8F4F8' },
      ],
    },
    {
      id: 3006,
      name: 'Accent Chair',
      type: 'seating',
      basePrice: 549.95,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 60,
        maxWidth: 80,
        minHeight: 80,
        maxHeight: 100,
        depth: 70,
      },
      availableColors: [
        { name: 'Velvet Blue', code: '#4169E1' },
        { name: 'Gray Fabric', code: '#A9A9A9' },
        { name: 'Beige Linen', code: '#F5F5DC' },
        { name: 'Emerald Green', code: '#50C878' },
      ],
    },
  ];

  constructor(
    private datosService: Datos,
    private cartService: CartService,
    private router: Router,
    private loginPrompt: LoginRequiredModalService
  ) {}

  ngOnInit() {
    this.loadLivingRoomSets();
    this.loadCustomFurnitureOptions();
    // detect admin role to change UI for admins
    this.datosService.getLoggedUser().subscribe({
      next: (u: any) => {
        const role = u && u.rol ? u.rol : u && u.role ? u.role : null;
        this.isAdmin = role && (role === 'admin' || role === 'carpintero' || role === 'superadmin');
      },
      error: () => {
        this.isAdmin = false;
      },
    });
    // Sync local livingRoomSets when a product is updated elsewhere
    this.datosService.productUpdated$.subscribe((prod: any) => {
      if (!prod || !prod.id) return;
      const idx = this.livingRoomSets.findIndex((s) => s.id === prod.id);
      if (idx !== -1) {
        this.livingRoomSets[idx] = {
          ...this.livingRoomSets[idx],
          name: prod.name ?? this.livingRoomSets[idx].name,
          basePrice: prod.price ?? this.livingRoomSets[idx].basePrice,
          image: prod.image ?? this.livingRoomSets[idx].image,
          dimensions: prod.dimensions ?? this.livingRoomSets[idx].dimensions,
        };
        if (this.selectedSet && this.selectedSet.id === prod.id)
          this.selectedSet = this.livingRoomSets[idx];
      }
    });
  }

  loadLivingRoomSets() {
    this.isLoading = true;
    this.loadError = '';

    this.datosService.getLivingRoomSets().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        this.livingRoomSets = apiProducts.map((ap) => ({
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
            depth: ap.dimensions?.depth || '',
          },
          availableColors: ap.colors,
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading living room sets:', error);
        this.loadError = 'Failed to load living room sets. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  loadCustomFurnitureOptions() {
    this.isLoadingCustomFurniture = true;
    this.customFurnitureError = '';

    this.datosService.getCustomFurnitureOptions('livingroom').subscribe({
      next: (options: any[]) => {
        if (Array.isArray(options) && options.length > 0) {
          this.customFurnitureOptions = options.map((option) => this.mapOptionToFurniture(option));
        } else {
          this.customFurnitureOptions = this.getFallbackFurnitureOptions();
        }
        this.isLoadingCustomFurniture = false;
      },
      error: (error) => {
        console.error('Error loading living room custom furniture options:', error);
        this.customFurnitureError =
          'No se pudieron cargar las opciones personalizadas del salon. Mostrando opciones base.';
        this.customFurnitureOptions = this.getFallbackFurnitureOptions();
        this.isLoadingCustomFurniture = false;
      },
    });
  }

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
      quantity: 1,
    };
    this.customSelections.push(selection);
  }

  removeCustomSelection(index: number) {
    this.customSelections.splice(index, 1);
  }

  openEditFurnitureModal(furniture: CustomFurniture, event?: Event) {
    if (!this.isAdmin) return;
    event?.stopPropagation();
    this.editingCustomFurnitureOption = furniture;
    this.modalAdminMode = true;
    this.modalItem = this.buildModalItemFromFurniture(furniture);
    this.modalProductId = null;
    this.showModal = true;
  }

  requestDeleteFurnitureOption(furniture: CustomFurniture, event?: Event) {
    if (!this.isAdmin) return;
    event?.stopPropagation();
    this.furnitureConfirmAction = 'delete';
    this.pendingFurnitureId = furniture.id;
    this.optionPendingDelete = furniture;
    this.pendingFurniturePayload = null;
    this.furnitureConfirmTitle = 'Confirmar exclusion';
    this.furnitureConfirmMessage = `¿Deseas excluir "${furniture.name}" de las opciones disponibles?`;
    this.showFurnitureConfirm = true;
  }

  requestAddFurnitureOption() {
    if (!this.isAdmin) return;

    const payload = this.buildFurniturePayloadFromForm(this.newFurnitureForm);
    if (!payload) {
      return;
    }

    this.furnitureConfirmAction = 'add';
    this.pendingFurniturePayload = payload;
    this.pendingFurnitureId = null;
    this.furnitureConfirmTitle = 'Confirmar nuevo mueble';
    this.furnitureConfirmMessage = `¿Deseas agregar "${payload.name}" a las opciones del salon?`;
    this.showFurnitureConfirm = true;
  }
  confirmFurnitureAction() {
    if (!this.furnitureConfirmAction) return;
    this.showFurnitureConfirm = false;
    this.executeFurnitureAction();
  }

  cancelFurnitureAction() {
    this.showFurnitureConfirm = false;
    this.pendingFurniturePayload = null;
    this.pendingFurnitureId = null;
    this.furnitureConfirmAction = null;
    this.optionPendingDelete = null;
  }

  private executeFurnitureAction() {
    if (!this.furnitureConfirmAction) return;
    const action = this.furnitureConfirmAction;
    this.isProcessingFurniture = true;

    if (action === 'add' && this.pendingFurniturePayload) {
      this.datosService.createCustomFurnitureOption(this.pendingFurniturePayload).subscribe({
        next: (res) => {
          if (res?.success && res.option) {
            const option = this.mapOptionToFurniture(res.option);
            this.handleFurnitureActionSuccess('add', option);
          } else {
            this.handleFurnitureActionError('No se pudo crear el mueble.');
          }
        },
        error: (error) => {
          console.error('Error creating living room furniture option', error);
          this.handleFurnitureActionError('Error creando el nuevo mueble.');
        }
      });
      return;
    }

    if (action === 'delete' && this.pendingFurnitureId) {
      const id = this.pendingFurnitureId;
      this.datosService.deleteCustomFurnitureOption(id).subscribe({
        next: (res) => {
          if (res?.success) {
            this.handleFurnitureActionSuccess('delete');
          } else {
            this.handleFurnitureActionError('No se pudo excluir el mueble.');
          }
        },
        error: (error) => {
          console.error('Error deleting living room furniture option', error);
          this.handleFurnitureActionError('Error excluyendo el mueble.');
        }
      });
    }
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
    return this.customSpaceWidth > 0 && this.customSpaceHeight > 0 && this.customSpaceDepth > 0;
  }

  sendCustomOrderToCarpenters() {
    if (!this.isCustomSpaceValid() || this.customSelections.length === 0) {
      alert('Please enter space dimensions and select at least one furniture item.');
      return;
    }

    const orderData = {
      // human readable title to store as project/pedido name
      title: (() => {
        const names = this.customSelections.map((s) => s.furniture.name).filter(Boolean);
        const setName = this.selectedSet?.name;
        const base =
          setName || (names.length ? names.slice(0, 3).join(', ') : 'Pedido personalizado');
        return `Pedido personalizado - ${base}`;
      })(),
      type: 'custom-livingroom',
      spaceDimensions: {
        width: this.customSpaceWidth,
        height: this.customSpaceHeight,
        depth: this.customSpaceDepth,
      },
      furniture: this.customSelections.map((sel) => ({
        name: sel.furniture.name,
        type: sel.furniture.type,
        color: sel.selectedColor.name,
        image: sel.furniture.image || null,
        dimensions: {
          width: sel.customWidth,
          height: sel.customHeight,
          depth: sel.furniture.dimensions.depth,
        },
        quantity: sel.quantity,
        price: this.calculateCustomPrice(sel),
      })),
      images: Array.from(
        new Set(this.customSelections.map((s) => s.furniture.image).filter(Boolean))
      ),
      totalPrice: this.getTotalCustomPrice(),
      timestamp: new Date().toISOString(),
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
        this.toastMessage = `Custom living room order submitted! Total: €${this.customOrderData.totalPrice.toFixed(
          2
        )}`;
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 3500);

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
      },
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
        code: this.selectedSetColor.code,
      },
      dimensions: this.selectedSet.dimensions ?? null,
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
        code: defaultColor.code,
      },
      dimensions: set.dimensions ?? null,
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
              dimensions:
                this.selectedSet?.dimensions || (this.modalItem as any).dimensions || null,
            });

            // Close modal and show toast
            this.closeModal();
            this.toastMessage = `${this.currentProductName} has been added to cart successfully!`;
            this.showToast = true;
            setTimeout(() => {
              this.showToast = false;
            }, 3500);
          } else {
            this.closeModal();
            this.loginPrompt.open('You need to be logged to add items to the cart.');
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
                selectedColor: this.modalItem!.selectedColor,
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
          this.loginPrompt.open('You need to be logged to add items to the cart.');
        },
      });
    }
  }

  // Called when admin saves modifications from the modal
  saveModified(edited: any) {
    if (!edited) return;

    if (this.editingCustomFurnitureOption) {
      this.saveCustomFurnitureChanges(edited);
      return;
    }

    this.modalItem = { ...(this.modalItem ?? {}), ...edited } as ModalCartItem;
    this.showModal = false;

    const targetId = this.modalProductId ?? (this.selectedSet ? this.selectedSet.id : null);
    if (targetId == null) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
      return;
    }

    const idx = this.livingRoomSets.findIndex((s) => s.id === targetId);
    if (idx === -1) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
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
      dimensions: updatedDimensions,
    };
    this.livingRoomSets[idx] = updatedSet;
    if (this.selectedSet && this.selectedSet.id === targetId) {
      this.selectedSet = updatedSet;
    }

    const payload: any = {
      id: targetId,
      name: updatedSet.name,
      price: updatedSet.basePrice,
      image: updatedSet.image,
    };
    if (updatedDimensions) {
      payload.dimensions = updatedDimensions;
    }
    console.log('Livingroom.saveModified: calling updateProduct with payload', payload);

    this.datosService.updateProduct(payload).subscribe({
      next: () => {
        this.toastMessage = 'Cambios guardados en el servidor.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving product changes to server', err);
        this.toastMessage = 'Error guardando en el servidor. Los cambios quedaron locales.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 4000);
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.modalItem = null;
    this.modalProductId = null;
    this.modalAdminMode = false;
    this.editingCustomFurnitureOption = null;
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
        this.loadLivingRoomSets(); // << recarga livingroom
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

  private saveCustomFurnitureChanges(edited: any) {
    const current = this.editingCustomFurnitureOption;
    if (!current) return;

    this.showModal = false;
    this.modalItem = null;
    this.modalProductId = null;
    this.modalAdminMode = false;

    const colorsInput =
      typeof edited.colors === 'string' && edited.colors.trim().length
        ? edited.colors
        : this.formatColorInput(current.availableColors);

    const payload: CustomFurnitureOptionPayload = {
      id: current.id,
      service: 'livingroom',
      name: this.coalesceString(edited.name, current.name),
      type: this.coalesceString(edited.type, current.type),
      basePrice: this.toNumberOrFallback(edited.price, current.basePrice),
      image: this.coalesceString(edited.image, current.image),
      minWidth: this.toNumberOrFallback(edited.minWidth, current.dimensions.minWidth),
      maxWidth: this.toNumberOrFallback(edited.maxWidth, current.dimensions.maxWidth),
      minHeight: this.toNumberOrFallback(edited.minHeight, current.dimensions.minHeight),
      maxHeight: this.toNumberOrFallback(edited.maxHeight, current.dimensions.maxHeight),
      depth: this.toNumberOrFallback(edited.depth, current.dimensions.depth),
      availableColors: this.parseColorInput(colorsInput),
    };

    this.isProcessingFurniture = true;
    this.datosService.updateCustomFurnitureOption(current.id, payload).subscribe({
      next: () => {
        this.isProcessingFurniture = false;
        const updatedFurniture: CustomFurniture = {
          ...current,
          name: payload.name,
          type: payload.type,
          basePrice: payload.basePrice,
          image: payload.image || current.image,
          dimensions: {
            minWidth: payload.minWidth,
            maxWidth: payload.maxWidth,
            minHeight: payload.minHeight,
            maxHeight: payload.maxHeight,
            depth: payload.depth,
          },
          availableColors: payload.availableColors.map((color) => ({ ...color })),
        };
        this.customFurnitureOptions = this.customFurnitureOptions.map((option) =>
          option.id === current.id ? updatedFurniture : option
        );
        this.updateSelectionsWithFurniture(updatedFurniture);
        this.toastMessage = 'Opcion personalizada actualizada.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 2000);
        this.editingCustomFurnitureOption = null;
      },
      error: (error) => {
        this.isProcessingFurniture = false;
        console.error('Error updating living room custom furniture option', error);
        this.toastMessage = 'Error al actualizar la opcion personalizada.';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 4000);
        this.editingCustomFurnitureOption = null;
      },
    });
  }

  private handleFurnitureActionSuccess(action: 'add' | 'delete', option?: CustomFurniture) {
    if (action === 'add' && option) {
      this.customFurnitureOptions = [...this.customFurnitureOptions, option];
      this.toastMessage = `${option.name} anadido correctamente.`;
      this.newFurnitureForm = this.createEmptyFurnitureForm();
    }

    if (action === 'delete') {
      const deletedOption = this.optionPendingDelete;
      const targetId = deletedOption?.id ?? this.pendingFurnitureId;
      if (targetId != null) {
        this.customFurnitureOptions = this.customFurnitureOptions.filter((f) => f.id !== targetId);
        this.removeSelectionsByFurnitureId(targetId);
      }
      this.toastMessage = deletedOption
        ? `${deletedOption.name} excluido correctamente.`
        : 'Mueble excluido correctamente.';
    }

    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
    this.resetFurnitureActionState();
  }

  private handleFurnitureActionError(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3500);
    this.resetFurnitureActionState();
  }

  private resetFurnitureActionState() {
    this.isProcessingFurniture = false;
    this.furnitureConfirmAction = null;
    this.pendingFurniturePayload = null;
    this.pendingFurnitureId = null;
    this.optionPendingDelete = null;
  }

  private buildModalItemFromFurniture(furniture: CustomFurniture): ModalCartItem {
    const primaryColor =
      furniture.availableColors[0] ?? ({ name: 'Personalizado', code: '#C0C0C0' } as Color);

    return {
      id: furniture.id,
      name: furniture.name,
      price: furniture.basePrice,
      image: furniture.image,
      selectedColor: { ...primaryColor },
      dimensions: {
        width: `${furniture.dimensions.minWidth}-${furniture.dimensions.maxWidth}cm`,
        height: `${furniture.dimensions.minHeight}-${furniture.dimensions.maxHeight}cm`,
        depth: `${furniture.dimensions.depth}cm`,
      },
      isCustomFurniture: true,
      type: furniture.type,
      minWidth: furniture.dimensions.minWidth,
      maxWidth: furniture.dimensions.maxWidth,
      minHeight: furniture.dimensions.minHeight,
      maxHeight: furniture.dimensions.maxHeight,
      depth: furniture.dimensions.depth,
      colors: this.formatColorInput(furniture.availableColors),
    };
  }

  private formatColorInput(colors: Color[]): string {
    return colors.map((color) => `${color.name}:${color.code}`).join(', ');
  }

  private toNumberOrFallback(value: any, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private coalesceString(value: any, fallback: string): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || fallback;
    }
    return fallback;
  }

  private buildFurniturePayloadFromForm(form: NewFurnitureForm): CustomFurnitureOptionPayload | null {
    const {
      name,
      type,
      basePrice,
      image,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      depth,
      colors,
    } = form;

    if (
      !name.trim() ||
      !type.trim() ||
      basePrice == null ||
      minWidth == null ||
      maxWidth == null ||
      minHeight == null ||
      maxHeight == null ||
      depth == null
    ) {
      alert('Completa todos los campos obligatorios antes de continuar.');
      return null;
    }

    return {
      service: 'livingroom',
      name: name.trim(),
      type: type.trim(),
      basePrice: Number(basePrice),
      image: image?.trim() || 'https://via.placeholder.com/400x400.png?text=Nuevo+mueble',
      minWidth: Number(minWidth),
      maxWidth: Number(maxWidth),
      minHeight: Number(minHeight),
      maxHeight: Number(maxHeight),
      depth: Number(depth),
      availableColors: this.parseColorInput(colors),
    };
  }

  private updateSelectionsWithFurniture(furniture: CustomFurniture) {
    this.customSelections = this.customSelections.map((selection) =>
      selection.furniture.id === furniture.id ? { ...selection, furniture } : selection
    );
  }

  private removeSelectionsByFurnitureId(furnitureId: number) {
    this.customSelections = this.customSelections.filter(
      (selection) => selection.furniture.id !== furnitureId
    );
  }

  private parseColorInput(input: string): Color[] {
    const fallback: Color[] = [{ name: 'Personalizado', code: '#C0C0C0' }];
    if (!input || !input.trim()) {
      return fallback;
    }

    const parsed = input.split(',').map((item) => {
      const [name, hex] = item.split(':').map((value) => value.trim());
      if (!name) {
        return null;
      }
      const code = hex?.startsWith('#') ? hex : hex ? `#${hex}` : '#C0C0C0';
      return { name, code };
    });

    const colors = parsed.filter((color): color is Color => !!color && !!color.name);
    return colors.length ? colors : fallback;
  }

  private createEmptyFurnitureForm(): NewFurnitureForm {
    return {
      name: '',
      type: '',
      basePrice: null,
      image: '',
      minWidth: null,
      maxWidth: null,
      minHeight: null,
      maxHeight: null,
      depth: null,
      colors: '',
    };
  }

  private mapOptionToFurniture(option: any): CustomFurniture {
    const dimensions = option?.dimensions ?? option ?? {};
    const rawId = option?.id ?? option?.optionId ?? Date.now();
    const numericId = Number(rawId);
    const safeId = Number.isFinite(numericId) ? numericId : Date.now();
    const safeColors =
      Array.isArray(option?.availableColors) && option.availableColors.length > 0
        ? option.availableColors
        : [{ name: 'Personalizado', code: '#C0C0C0' }];

    return {
      id: safeId,
      name: option?.name ?? 'Custom Option',
      type: option?.type ?? 'fixture',
      basePrice: Number(option?.basePrice ?? option?.price ?? 0),
      image:
        option?.image || option?.image_url || 'https://via.placeholder.com/400x400.png?text=Custom',
      dimensions: {
        minWidth: Number(dimensions?.minWidth ?? option?.minWidth ?? 0),
        maxWidth: Number(dimensions?.maxWidth ?? option?.maxWidth ?? 0),
        minHeight: Number(dimensions?.minHeight ?? option?.minHeight ?? 0),
        maxHeight: Number(dimensions?.maxHeight ?? option?.maxHeight ?? 0),
        depth: Number(dimensions?.depth ?? option?.depth ?? 0),
      },
      availableColors: safeColors.map((color: any) => ({
        name: color?.name ?? color?.nombre ?? 'Color',
        code: color?.code ?? color?.codigo_hex ?? '#C0C0C0',
      })),
    };
  }

  private getFallbackFurnitureOptions(): CustomFurniture[] {
    return this.fallbackFurnitureOptions.map((option) => ({
      ...option,
      dimensions: { ...option.dimensions },
      availableColors: option.availableColors.map((color) => ({ ...color })),
    }));
  }
}
