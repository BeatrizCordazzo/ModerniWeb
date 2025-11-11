import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Datos, PublicReview } from '../datos';

@Component({
  selector: 'app-reviews',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})
export class Reviews implements OnInit {
  reviews: PublicReview[] = [];
  isLoading = true;
  error = '';
  stars = [1, 2, 3, 4, 5];

  constructor(private datos: Datos) {}

  ngOnInit(): void {
    this.datos.getPublicReviews().subscribe({
      next: (res) => {
        if (res && res.success && Array.isArray(res.reviews)) {
          this.reviews = res.reviews;
          if (!this.reviews.length) {
            this.error = 'Todavía no hay reseñas disponibles.';
          }
        } else {
          this.error = 'No pudimos cargar reseñas.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No pudimos cargar reseñas.';
        this.isLoading = false;
      }
    });
  }
}
