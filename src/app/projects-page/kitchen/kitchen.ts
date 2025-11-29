import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Datos, ShowcaseProject } from '../../datos';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kitchen',
  imports: [CommonModule, ConfirmationModal],
  templateUrl: './kitchen.html',
  styleUrl: './kitchen.scss',
})
export class Kitchen implements OnInit, OnDestroy {
  projects: ShowcaseProject[] = [];
  isLoading = true;
  errorMessage = '';
  selectedProject: ShowcaseProject | null = null;
  isAdmin = false;

  // Confirmation modal
  showDeleteConfirm = false;
  projectToDelete: number | null = null;

  private projectsSubscription?: Subscription;

  constructor(private datosService: Datos, private router: Router) {}

  ngOnInit() {
    this.loadProjects();
    this.checkAdminStatus();

    // Subscribe to project changes
    this.projectsSubscription = this.datosService.showcaseProjectsChanged$.subscribe(() => {
      this.loadProjects();
    });
  }

  ngOnDestroy() {
    if (this.projectsSubscription) {
      this.projectsSubscription.unsubscribe();
    }
  }

  checkAdminStatus() {
    this.datosService.getLoggedUser().subscribe({
      next: (user) => {
        const role = user && (user.rol || user.role) ? user.rol || user.role : null;
        this.isAdmin = !!role && ['admin', 'arquitecto'].includes(role);
      },
      error: () => {
        this.isAdmin = false;
      },
    });
  }

  loadProjects() {
    this.isLoading = true;
    this.errorMessage = '';

    this.datosService.getKitchenProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading kitchen projects:', error);
        this.errorMessage = 'Error loading kitchen projects. Please try again.';
        this.isLoading = false;
      },
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

  confirmDeleteProject(projectId: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.projectToDelete = projectId;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.projectToDelete = null;
  }

  executeDelete() {
    if (!this.isAdmin || !this.projectToDelete) {
      return;
    }

    this.datosService.deleteShowcaseProject(this.projectToDelete).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.projectToDelete = null;
        // Projects will be reloaded via subscription
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        this.showDeleteConfirm = false;
        this.projectToDelete = null;
        this.errorMessage = 'Error deleting the project.';
      },
    });
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
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      bedroom: 'Bedroom',
      livingroom: 'Living Room',
      others: 'Custom Furniture',
    };
    return categoryNames[category] || category;
  }

  goToServices() {
    this.router.navigate(['/services']);
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }
}
