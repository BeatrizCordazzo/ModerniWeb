import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartConfirmationModal, CartItem } from '../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { CustomOrderConfirmationModal } from '../../shared/custom-order-confirmation-modal/custom-order-confirmation-modal';
import { ToastNotification } from '../../shared/toast-notification/toast-notification';
import { Datos, Product as ApiProduct, Color } from '../../datos';
import { CartService } from '../../shared/cart.service';
import { Router } from '@angular/router';

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
  selector: 'app-bathroom',
  imports: [CommonModule, FormsModule, CartConfirmationModal, ToastNotification, CustomOrderConfirmationModal],
  templateUrl: './bathroom.html',
  styleUrl: './bathroom.scss'
})
export class Bathroom implements OnInit {
  // Modal state
  showModal = false;
  modalItem: CartItem | null = null;
  
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

  constructor(private datosService: Datos, private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.loadBathroomSets();
  }

  loadBathroomSets() {
    this.isLoading = true;
    this.loadError = '';
    
    this.datosService.getBathroomSets().subscribe({
      next: (apiProducts: ApiProduct[]) => {
        this.bathroomSets = apiProducts.map(ap => ({
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
        console.error('Error loading bathroom sets:', error);
        this.loadError = 'Failed to load bathroom sets. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  customFurnitureOptions: CustomFurniture[] = [
    {
      id: 'vanity',
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
      id: 'mirror',
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
      id: 'storage-cabinet',
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
      id: 'shower-enclosure',
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
      id: 'bathtub',
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
      id: 'towel-rack',
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
      alert('Please enter space dimensions and select at least one item.');
      return;
    }

    const orderData = {
      type: 'custom-bathroom',
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

    // open confirmation modal
    this.customOrderData = orderData;
    this.showCustomModal = true;
  }

  confirmSendCustomOrder(): void {
    if (!this.customOrderData) return;
    console.log('Sending custom order to carpenters:', this.customOrderData);
    this.toastMessage = `Custom bathroom order sent! Total: €${this.customOrderData.totalPrice.toFixed(2)}`;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3500);

    this.customSelections = [];
    this.customSpaceWidth = 0;
    this.customSpaceHeight = 0;
    this.customSpaceDepth = 0;

    this.closeCustomModal();
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

  quickAddToCart(set: BathroomSet) {
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
      this.datosService.getLoggedUser().subscribe({
        next: (user) => {
          const isLogged = user && user.email;
          if (isLogged) {
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

  closeModal(): void {
    this.showModal = false;
    this.modalItem = null;
  }
}
