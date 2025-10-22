import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Datos, ShowcaseProject } from '../../datos';

@Component({
  selector: 'app-others',
  imports: [CommonModule],
  templateUrl: './others.html',
  styleUrl: './others.scss'
})
export class Others implements OnInit {
  projects: ShowcaseProject[] = [];
  isLoading = true;
  errorMessage = '';
  selectedProject: ShowcaseProject | null = null;

  constructor(private datosService: Datos) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.datosService.getOthersProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading others projects:', error);
        this.errorMessage = 'Error al cargar los proyectos personalizados. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  viewProject(project: ShowcaseProject) {
    this.selectedProject = project;
  }

  closeModal() {
    this.selectedProject = null;
  }

  retryLoad() {
    this.loadProjects();
  }

  // Helper method to calculate start date
  getStartDate(completedDate: string, duration: number): Date {
    const completed = new Date(completedDate);
    const start = new Date(completed);
    start.setDate(start.getDate() - duration);
    return start;
  }

  // Helper method to get category display name
  getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'kitchen': 'Cocina',
      'bathroom': 'Baño',
      'bedroom': 'Dormitorio',
      'livingroom': 'Sala de Estar',
      'others': 'Muebles Personalizados'
    };
    return categoryNames[category] || category;
  }
}
