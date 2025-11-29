import { Component, OnInit, OnDestroy } from '@angular/core';
import { Nav } from "../nav/nav";
import { Projects } from "../projects/projects";
import { Preview } from "../preview/preview";
import { Reviews } from "../reviews/reviews";
import { Footer } from "../footer/footer";


interface Project {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-home',
  imports: [Nav, Projects, Preview, Reviews, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  currentSlide = 0;
  private autoPlayInterval: any;

  projects: Project[] = [
    {
      title: 'Modern Minimalist Kitchen',
      description: 'Contemporary design with top-quality finishes',
      image: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=1200&h=600&fit=crop'
    },
    {
      title: 'Elegant Living Room',
      description: 'Cozy space with sophisticated style',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop'
    },
    {
      title: 'Dream Bedroom',
      description: 'Your personal retreat for rest',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=600&fit=crop'
    },
    {
      title: 'Spa Bathroom',
      description: 'Comfort and elegance in every detail',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=600&fit=crop'
    },
    {
      title: 'Custom Furniture',
      description: 'Unique pieces designed to measure',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&h=600&fit=crop'
    }
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.projects.length;
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 
      ? this.projects.length - 1 
      : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
