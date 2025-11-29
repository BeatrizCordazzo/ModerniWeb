import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  CartConfirmationModal,
  CartItem,
} from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { CustomOrderConfirmationModal } from '../../shared/custom-order-confirmation-modal/custom-order-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color, CustomFurnitureOptionPayload } from '../../datos';
import { CartService } from '../../shared/cart.service';
import { Router } from '@angular/router';
import { FavoriteToggleComponent } from '../../shared/favorite-toggle/favorite-toggle';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';
import { LoginRequiredModalService } from '../../shared/login-required-modal/login-required-modal.service';

interface BathroomSet {
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
  selector: 'app-bathroom',
  imports: [
    FormsModule,
    CartConfirmationModal,
    ToastNotification,
    CustomOrderConfirmationModal,
    FavoriteToggleComponent,
    ConfirmationModal,
  ],
  templateUrl: './bathroom.html',
  styleUrl: './bathroom.scss',
})
export class Bathroom implements OnInit {
  // Modal state
  showModal = false;
  modalAdminMode = false;
  isAdmin = false;
  modalItem: ModalCartItem | null = null;
  modalProductId: number | null = null;
  showDeleteConfirm = false;
  productToDelete: number | null = null;

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

  bathroomSets: BathroomSet[] = [];

  constructor(
    private datosService: Datos,
    private cartService: CartService,
    private router: Router,
    private loginPrompt: LoginRequiredModalService
  ) {}

  ngOnInit() {
    this.loadBathroomSets();
    this.loadCustomFurnitureOptions();
    this.datosService.getLoggedUser().subscribe({
      next: (u: any) => {
        const role = u && u.rol ? u.rol : u && u.role ? u.role : null;
        this.isAdmin = role && (role === 'admin' || role === 'carpintero' || role === 'superadmin');
      },
      error: () => {
        this.isAdmin = false;
      },
    });
    // Update local list when a product is changed elsewhere
    this.datosService.productUpdated$.subscribe((prod: any) => {
      if (!prod || !prod.id) return;
      const idx = this.bathroomSets.findIndex((s) => s.id === prod.id);
      if (idx !== -1) {
        this.bathroomSets[idx] = {
          ...this.bathroomSets[idx],
          name: prod.name ?? this.bathroomSets[idx].name,
          basePrice: prod.price ?? this.bathroomSets[idx].basePrice,
          image: prod.image ?? this.bathroomSets[idx].image,
          dimensions: prod.dimensions ?? this.bathroomSets[idx].dimensions,
        };
        if (this.selectedSet && this.selectedSet.id === prod.id)
          this.selectedSet = this.bathroomSets[idx];
      }
    });
  }

  loadBathroomSets() {
    this.isLoading = true;
    this.loadError = '';

    this.datosService.getBathroomSets().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        this.bathroomSets = apiProducts.map((ap) => ({
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
        console.error('Error loading bathroom sets:', error);
        this.loadError = 'Failed to load bathroom sets. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  loadCustomFurnitureOptions() {
    this.isLoadingCustomFurniture = true;
    this.customFurnitureError = '';

    this.datosService.getCustomFurnitureOptions('bathroom').subscribe({
      next: (options: any[]) => {
        if (Array.isArray(options)) {
          this.customFurnitureOptions = options.map((option) => this.mapOptionToFurniture(option));
        } else {
          this.customFurnitureOptions = [];
        }
        this.isLoadingCustomFurniture = false;
      },
      error: (error) => {
        console.error('Error loading bathroom custom furniture options:', error);
        this.customFurnitureError = 'No se pudieron cargar las opciones personalizadas del baño.';
        this.isLoadingCustomFurniture = false;
      },
    });
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

  private readonly fallbackFurnitureOptions: CustomFurniture[] = [
    {
      id: 1001,
      name: 'Bathroom Vanity',
      type: 'storage',
      basePrice: 599.95,
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 60,
        maxWidth: 180,
        minHeight: 80,
        maxHeight: 90,
        depth: 50
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Gray', code: '#808080' },
        { name: 'Black', code: '#000000' }
      ]
    },
    {
      id: 1002,
      name: 'Bathroom Mirror',
      type: 'accessory',
      basePrice: 199.95,
      image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 50,
        maxWidth: 150,
        minHeight: 60,
        maxHeight: 120,
        depth: 5
      },
      availableColors: [
        { name: 'Chrome Frame', code: '#C0C0C0' },
        { name: 'Black Frame', code: '#000000' },
        { name: 'Gold Frame', code: '#FFD700' },
        { name: 'Frameless', code: '#FFFFFF' }
      ]
    },
    {
      id: 1003,
      name: 'Storage Cabinet',
      type: 'storage',
      basePrice: 399.95,
      image: 'https://images.unsplash.com/photo-1595516695946-e22a04b82d70?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 40,
        maxWidth: 80,
        minHeight: 120,
        maxHeight: 200,
        depth: 30
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Oak', code: '#D2B48C' },
        { name: 'Gray', code: '#808080' },
        { name: 'Walnut', code: '#5C4033' }
      ]
    },
    {
      id: 1004,
      name: 'Shower Enclosure',
      type: 'fixture',
      basePrice: 899.95,
      image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 80,
        maxWidth: 120,
        minHeight: 180,
        maxHeight: 200,
        depth: 80
      },
      availableColors: [
        { name: 'Clear Glass', code: '#E8F4F8' },
        { name: 'Frosted Glass', code: '#F0F0F0' },
        { name: 'Black Frame', code: '#000000' },
        { name: 'Chrome Frame', code: '#C0C0C0' }
      ]
    },
    {
      id: 1005,
      name: 'Bathtub',
      type: 'fixture',
      basePrice: 1299.95,
      image: 'https://images.unsplash.com/photo-1564540583246-934409427776?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 140,
        maxWidth: 180,
        minHeight: 50,
        maxHeight: 65,
        depth: 70
      },
      availableColors: [
        { name: 'White', code: '#FFFFFF' },
        { name: 'Matte Black', code: '#1C1C1C' },
        { name: 'Cream', code: '#FFFDD0' }
      ]
    },
    {
      id: 1006,
      name: 'Heated Towel Rack',
      type: 'accessory',
      basePrice: 299.95,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop',
      dimensions: {
        minWidth: 50,
        maxWidth: 80,
        minHeight: 80,
        maxHeight: 120,
        depth: 15
      },
      availableColors: [
        { name: 'Chrome', code: '#C0C0C0' },
        { name: 'Brushed Nickel', code: '#B8B8B8' },
        { name: 'Matte Black', code: '#1C1C1C' },
        { name: 'Brass', code: '#B5A642' }
      ]
    }
  ];

  customFurnitureOptions: CustomFurniture[] = [];
  isLoadingCustomFurniture = false;
  customFurnitureError = '';
  newFurnitureForm: NewFurnitureForm = this.createEmptyFurnitureForm();
  editFurnitureForm: NewFurnitureForm = this.createEmptyFurnitureForm();
  editingFurnitureId: number | null = null;
  showEditOptionModal = false;
  showFurnitureConfirm = false;
  furnitureConfirmTitle = '';
  furnitureConfirmMessage = '';
  furnitureConfirmAction: 'add' | 'update' | 'delete' | null = null;
  pendingFurniturePayload: CustomFurnitureOptionPayload | null = null;
  pendingFurnitureId: number | null = null;
  optionPendingDelete: CustomFurniture | null = null;
  isProcessingFurniture = false;

  viewMode: 'sets' | 'custom' = 'sets';
  selectedSet: BathroomSet | null = null;
  selectedSetColor: Color | null = null;
  customSpaceWidth: number = 0;
  customSpaceHeight: number = 0;
  customSpaceDepth: number = 0;
  customSelections: CustomSelection[] = [];
  showColorPicker: boolean = false;

  selectSet(set: BathroomSet) {
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
    this.editingFurnitureId = furniture.id;
    this.editFurnitureForm = this.convertFurnitureToForm(furniture);
    this.showEditOptionModal = true;
  }

  closeEditFurnitureModal() {
    this.showEditOptionModal = false;
    this.editingFurnitureId = null;
    this.editFurnitureForm = this.createEmptyFurnitureForm();
  }

  requestDeleteFurnitureOption(furniture: CustomFurniture, event?: Event) {
    if (!this.isAdmin) return;
    event?.stopPropagation();
    this.furnitureConfirmAction = 'delete';
    this.pendingFurnitureId = furniture.id;
    this.optionPendingDelete = furniture;
    this.pendingFurniturePayload = null;
    this.furnitureConfirmTitle = 'Confirmar exclusión';
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
    this.furnitureConfirmMessage = `¿Deseas añadir "${payload.name}" a las opciones del baño?`;
    this.showFurnitureConfirm = true;
  }

  requestSaveEditedOption() {
    if (!this.isAdmin || !this.editingFurnitureId) return;

    const payload = this.buildFurniturePayloadFromForm(this.editFurnitureForm);
    if (!payload) {
      return;
    }
    payload.id = this.editingFurnitureId;

    this.furnitureConfirmAction = 'update';
    this.pendingFurniturePayload = payload;
    this.pendingFurnitureId = this.editingFurnitureId;
    this.furnitureConfirmTitle = 'Confirmar modificación';
    this.furnitureConfirmMessage = `¿Deseas guardar los cambios de "${payload.name}"?`;
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
          console.error('Error creating furniture option', error);
          this.handleFurnitureActionError('Error creando el nuevo mueble.');
        },
      });
      return;
    }

    if (action === 'update' && this.pendingFurniturePayload && this.pendingFurnitureId) {
      const payload = this.pendingFurniturePayload;
      const id = this.pendingFurnitureId;
      this.datosService.updateCustomFurnitureOption(id, payload).subscribe({
        next: (res) => {
          if (res?.success && res.option) {
            const option = this.mapOptionToFurniture(res.option);
            this.handleFurnitureActionSuccess('update', option);
          } else {
            this.handleFurnitureActionError('No se pudo actualizar el mueble.');
          }
        },
        error: (error) => {
          console.error('Error updating furniture option', error);
          this.handleFurnitureActionError('Error guardando los cambios del mueble.');
        },
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
          console.error('Error deleting furniture option', error);
          this.handleFurnitureActionError('Error excluyendo el mueble.');
        },
      });
    }
  }

  private handleFurnitureActionSuccess(
    action: 'add' | 'update' | 'delete',
    option?: CustomFurniture
  ) {
    if (action === 'add' && option) {
      this.customFurnitureOptions = [...this.customFurnitureOptions, option];
      this.toastMessage = `${option.name} añadido correctamente.`;
      this.newFurnitureForm = this.createEmptyFurnitureForm();
    }

    if (action === 'update' && option) {
      const idx = this.customFurnitureOptions.findIndex((f) => f.id === option.id);
      if (idx !== -1) {
        this.customFurnitureOptions[idx] = option;
        this.customFurnitureOptions = [...this.customFurnitureOptions];
        this.updateSelectionsWithFurniture(option);
      }
      this.toastMessage = `${option.name} actualizado correctamente.`;
      this.closeEditFurnitureModal();
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

  private convertFurnitureToForm(furniture: CustomFurniture): NewFurnitureForm {
    return {
      name: furniture.name,
      type: furniture.type,
      basePrice: furniture.basePrice,
      image: furniture.image,
      minWidth: furniture.dimensions.minWidth,
      maxWidth: furniture.dimensions.maxWidth,
      minHeight: furniture.dimensions.minHeight,
      maxHeight: furniture.dimensions.maxHeight,
      depth: furniture.dimensions.depth,
      colors: furniture.availableColors.map((color) => `${color.name}:${color.code}`).join(', '),
    };
  }

  private buildFurniturePayloadFromForm(
    form: NewFurnitureForm
  ): CustomFurnitureOptionPayload | null {
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
      service: 'bathroom',
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
      alert('Please enter space dimensions and select at least one item.');
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
      type: 'custom-bathroom',
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
      // collect images selected/associated with the furniture items so carpintero can preview them
      images: Array.from(
        new Set(this.customSelections.map((s) => s.furniture.image).filter(Boolean))
      ),
      totalPrice: this.getTotalCustomPrice(),
      timestamp: new Date().toISOString(),
    };

    // open confirmation modal
    this.customOrderData = orderData;
    this.showCustomModal = true;
  }

  confirmSendCustomOrder(): void {
    if (!this.customOrderData) return;
    console.log('Sending custom order to carpenters:', this.customOrderData);
    this.datosService.createCustomOrder(this.customOrderData).subscribe({
      next: (res) => {
        this.toastMessage = `Custom bathroom order submitted! Total: €${this.customOrderData.totalPrice.toFixed(
          2
        )}`;
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 3500);

        this.customSelections = [];
        this.customSpaceWidth = 0;
        this.customSpaceHeight = 0;
        this.customSpaceDepth = 0;

        this.closeCustomModal();
      },
      error: (err) => {
        console.error('Error submitting custom order', err);
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
      alert('Please select a bathroom set and color.');
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

  quickAddToCart(set: BathroomSet) {
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
              dimensions:
                this.selectedSet?.dimensions || (this.modalItem as any).dimensions || null,
            });
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
          try {
            const raw = localStorage.getItem('loggedUser');
            if (raw) {
              this.cartService.addItem({
                name: this.modalItem!.name,
                description: this.modalItem!.description,
                price: this.modalItem!.price,
                image: this.modalItem!.image,
                selectedColor: this.modalItem!.selectedColor,
                dimensions:
                  this.selectedSet?.dimensions || (this.modalItem as any).dimensions || null,
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

  closeModal(): void {
    this.showModal = false;
    this.modalItem = null;
    this.modalProductId = null;
  }

  saveModified(edited: any) {
    if (!edited) return;
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

    const idx = this.bathroomSets.findIndex((s) => s.id === targetId);
    if (idx === -1) {
      this.toastMessage = 'Cambios guardados';
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
      return;
    }

    const currentSet = this.bathroomSets[idx];
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
    const updatedSet: BathroomSet = {
      ...currentSet,
      name: edited.name ?? currentSet.name,
      basePrice: updatedPrice,
      image: edited.image ?? currentSet.image,
      dimensions: updatedDimensions,
    };
    this.bathroomSets[idx] = updatedSet;
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
    console.log('Bathroom.saveModified: calling updateProduct with payload', payload);
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
        this.loadBathroomSets(); // << recarga bathroom
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
