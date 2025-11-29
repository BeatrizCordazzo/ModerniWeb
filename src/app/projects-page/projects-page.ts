import { Component, OnInit, OnDestroy } from '@angular/core';
import { Nav } from "../nav/nav";
import { Footer } from "../footer/footer";

import { RouterLink, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Datos, ShowcaseProject } from '../datos';
import { ConfirmationModal } from '../shared/confirmation-modal/confirmation-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-projects-page',
  imports: [Nav, Footer, RouterLink, RouterOutlet, ReactiveFormsModule, ConfirmationModal],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss'
})
export class ProjectsPage implements OnInit, OnDestroy {
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
  isAdmin = false;
  showAddForm = false;
  isSaving = false;
  saveError = '';
  saveSuccess = '';
  addProjectForm: FormGroup;
  
  // Confirmation modal
  showDeleteConfirm = false;
  projectToDelete: number | null = null;
  
  private projectsSubscription?: Subscription;

  constructor(private datosService: Datos, private fb: FormBuilder) {
    this.addProjectForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      categoria: ['kitchen', Validators.required],
      cliente: ['', Validators.required],
      ubicacion: ['', Validators.required],
      fecha_completado: ['', Validators.required],
      duracion_dias: [0, [Validators.required, Validators.min(1)]],
      presupuesto: [0, [Validators.required, Validators.min(0)]],
      imagenes: ['', Validators.required],
      estilo: ['', Validators.required],
      area_m2: [0, [Validators.required, Validators.min(1)]],
      materiales: [''],
      destacado: [false]
    });
  }

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
        const role = user && (user.rol || user.role) ? (user.rol || user.role) : null;
        this.isAdmin = !!role && ['admin', 'arquitecto'].includes(role);
      },
      error: () => { this.isAdmin = false; }
    });
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
        this.errorMessage = 'Error loading projects. Please try again.';
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
  
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.saveError = '';
    if (!this.showAddForm) {
      this.saveSuccess = '';
      this.resetForm();
    }
  }
  
  submitNewProject() {
    if (!this.isAdmin || this.isSaving) {
      return;
    }

    if (this.addProjectForm.invalid) {
      this.addProjectForm.markAllAsTouched();
      return;
    }

    const raw = this.addProjectForm.getRawValue();
    const payload: any = {
      titulo: raw.titulo?.trim(),
      descripcion: raw.descripcion?.trim(),
      categoria: raw.categoria,
      cliente: raw.cliente?.trim(),
      ubicacion: raw.ubicacion?.trim(),
      fecha_completado: raw.fecha_completado,
      duracion_dias: Number(raw.duracion_dias),
      presupuesto: Number(raw.presupuesto),
      imagenes: this.parseImagenes(raw.imagenes),
      estilo: raw.estilo?.trim(),
      area_m2: Number(raw.area_m2),
      materiales: this.parseMateriales(raw.materiales),
      destacado: raw.destacado ?? false
    };

    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = '';

    this.datosService.createShowcaseProject(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveSuccess = 'Project created successfully.';
        this.resetForm();
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.error?.error || 'Failed to create project.';
      }
    });
  }
  
  confirmDeleteProject(projectId: number) {
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
        this.errorMessage = 'Error deleting project.';
      }
    });
  }
  
  private resetForm() {
    this.addProjectForm.reset({
      titulo: '',
      descripcion: '',
      categoria: 'kitchen',
      cliente: '',
      ubicacion: '',
      fecha_completado: '',
      duracion_dias: 0,
      presupuesto: 0,
      imagenes: '',
      estilo: '',
      area_m2: 0,
      materiales: '',
      destacado: false
    });
  }
  
  private parseImagenes(raw: string | null | undefined): string[] {
    if (!raw) {
      return [];
    }
    return raw
      .split(/[\r\n,]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
  }
  
  private parseMateriales(raw: string | null | undefined): string[] {
    if (!raw) {
      return [];
    }
    return raw
      .split(/[\r\n,]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
  }
}
