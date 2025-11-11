import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';


interface ServicePreview {
  title: string;
  description: string;
  image: string;
  route: string;
}

@Component({
  selector: 'app-preview',
  imports: [],
  templateUrl: './preview.html',
  styleUrl: './preview.scss'
})
export class Preview implements AfterViewInit {
  @ViewChild('carouselWrapper') carouselWrapper!: ElementRef<HTMLDivElement>;
  
  canScrollLeft = false;
  canScrollRight = true;

  constructor(private router: Router) {}

  services: ServicePreview[] = [
    {
      title: 'Kitchen',
      description: 'Modern and functional kitchen designs tailored to your needs',
      image: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=600&h=400&fit=crop',
      route: '/services/kitchen'
    },
    {
      title: 'Bathroom',
      description: 'Elegant bathroom solutions combining comfort and style',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
      route: '/services/bathroom'
    },
    {
      title: 'Living Room',
      description: 'Create a welcoming space for your family and guests',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
      route: '/services/livingroom'
    },
    {
      title: 'Bedroom',
      description: 'Peaceful and personalized bedroom designs for ultimate relaxation',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop',
      route: '/services/bedroom'
    },
    {
      title: 'Single Pieces',
      description: 'Unique pieces designed specifically for your space',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&h=400&fit=crop',
      route: '/services/others'
    }
  ];

  ngAfterViewInit(): void {
    // Check scroll state after view initialization
    setTimeout(() => this.updateScrollButtons(), 100);
  }

  scrollLeft(): void {
    if (this.carouselWrapper) {
      const wrapper = this.carouselWrapper.nativeElement;
      wrapper.scrollBy({ left: -350, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.carouselWrapper) {
      const wrapper = this.carouselWrapper.nativeElement;
      wrapper.scrollBy({ left: 350, behavior: 'smooth' });
    }
  }

  onScroll(): void {
    this.updateScrollButtons();
  }

  private updateScrollButtons(): void {
    if (this.carouselWrapper) {
      const wrapper = this.carouselWrapper.nativeElement;
      this.canScrollLeft = wrapper.scrollLeft > 0;
      this.canScrollRight = wrapper.scrollLeft < (wrapper.scrollWidth - wrapper.clientWidth - 5);
    }
  }

  navigateToService(route: string): void {
    this.router.navigate([route]);
  }
}
