import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { Datos, FavoriteItem, FavoritePayload } from '../../datos';
import { LoginRequiredModalService } from '../login-required-modal/login-required-modal.service';

@Component({
  selector: 'app-favorite-toggle',
  standalone: true,
  imports: [],
  templateUrl: './favorite-toggle.html',
  styleUrl: './favorite-toggle.scss'
})
export class FavoriteToggleComponent implements OnInit, OnDestroy {
  @Input() itemType: 'product' | 'service' | 'custom' = 'product';
  @Input() itemId?: number | string | null;
  @Input() itemSlug?: string | null;
  @Input() itemName = '';
  @Input() itemImage?: string | null;
  @Input() itemPrice?: number | null;
  @Input() extra?: any;
  @Input() disabled = false;

  isFavorite = false;
  isLoading = false;
  private favoriteId: number | null = null;
  private sub?: Subscription;

  constructor(
    private datosService: Datos,
    private loginPrompt: LoginRequiredModalService
  ) {}

  ngOnInit(): void {
    this.sub = this.datosService.favorites$.subscribe(list => this.syncFavoriteState(list));
    // ensure favorites loaded at least once
    this.datosService.loadFavorites().subscribe({
      error: () => { /* ignore 401 */ }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled || this.isLoading) return;
    if (!this.itemName) {
      console.warn('FavoriteToggleComponent: itemName is required');
      return;
    }
    this.isLoading = true;
    if (this.isFavorite && this.favoriteId) {
      this.datosService.removeFavoriteById(this.favoriteId).subscribe({
        next: () => { this.isLoading = false; },
        error: (err) => this.handleError(err)
      });
    } else {
      const payload: FavoritePayload = {
        item_type: this.itemType,
        item_id: this.normalizeItemId(this.itemId),
        item_slug: this.itemSlug || this.deriveSlug(),
        item_name: this.itemName,
        item_image: this.itemImage,
        item_price: this.itemPrice,
        extra: this.extra
      };
      this.datosService.addFavorite(payload).subscribe({
        next: () => { this.isLoading = false; },
        error: (err) => this.handleError(err)
      });
    }
  }

  private syncFavoriteState(list: FavoriteItem[]): void {
    const match = list.find(fav => this.matchesFavorite(fav));
    this.isFavorite = !!match;
    this.favoriteId = match ? match.id : null;
  }

  private matchesFavorite(fav: FavoriteItem | undefined): boolean {
    if (!fav) return false;
    if (fav.item_type !== this.itemType) return false;
    const normalizedId = this.normalizeItemId(this.itemId);
    if (normalizedId !== null && normalizedId !== undefined && fav.item_id !== null && fav.item_id === normalizedId) {
      return true;
    }
    const slugToCompare = (this.itemSlug || this.deriveSlug() || '').toLowerCase();
    if (slugToCompare && (fav.item_slug || '').toLowerCase() === slugToCompare) {
      return true;
    }
    return normalizedId === null && fav.item_id === null && !slugToCompare && !fav.item_slug;
  }

  private normalizeItemId(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }

  private deriveSlug(): string | null {
    if (this.itemSlug) return this.itemSlug;
    if (!this.itemName) return null;
    return this.itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 100);
  }

  private handleError(err: any): void {
    console.error('Favorite toggle error', err);
    this.isLoading = false;
    if (err && err.status === 401) {
      this.loginPrompt.open('You need to be logged to add favorites.');
      return;
    }
    alert('Could not update favorites. Please try again.');
  }
}
