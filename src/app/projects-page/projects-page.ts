import { Component, OnInit } from '@angular/core';
import { Nav } from "../nav/nav";
import { Footer } from "../footer/footer";
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Datos, ShowcaseProject } from '../datos';

@Component({
  selector: 'app-projects-page',
  imports: [Nav, Footer, CommonModule, RouterLink, RouterOutlet],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss'
})
export class ProjectsPage implements OnInit {
  showcaseProjects: ShowcaseProject[] = [];
  categoryCounts: { [key: string]: number } = {
    kitchen: 0,
    bathroom: 0,
    bedroom: 0,
    livingroom: 0,
    others: 0
  };
  isLoading = true;
  errorMessage = '';

  constructor(private datosService: Datos) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.datosService.getShowcaseProjects().subscribe({
      next: (projects) => {
        this.showcaseProjects = projects;
        this.calculateCategoryCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading showcase projects:', error);
        this.errorMessage = 'Error al cargar los proyectos. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  calculateCategoryCounts() {
    // Reset counts
    Object.keys(this.categoryCounts).forEach(key => {
      this.categoryCounts[key] = 0;
    });
    
    // Count projects per category
    this.showcaseProjects.forEach(project => {
      if (this.categoryCounts.hasOwnProperty(project.categoria)) {
        this.categoryCounts[project.categoria]++;
      }
    });
  }

  retryLoad() {
    this.loadProjects();
  }
}
