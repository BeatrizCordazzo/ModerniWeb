import { Component, signal } from '@angular/core';
import { OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, FormsModule, RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav implements OnInit {
  title = signal('Moderni');
  searchQuery = signal('');
  isAdmin = false;

  onSearch() {
    console.log('Buscando:', this.searchQuery());
    // Aquí puedes implementar la lógica de búsqueda
  }

  // Drawer and submenu state
  drawerOpen = false;
  servicesOpen = false;
  projectsOpen = false;

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.servicesOpen = false;
    this.projectsOpen = false;
  }

  toggleServices() {
    this.servicesOpen = !this.servicesOpen;
  }

  toggleProjects() {
    this.projectsOpen = !this.projectsOpen;
  }

  ngOnInit(): void {
    // try to get logged user via service or localStorage
    try {
      // Prefer service call if available
      const stored = localStorage.getItem('loggedUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.isAdmin = parsed && parsed.rol === 'admin';
        return;
      }
    } catch (e) {
      // ignore
    }
  }
}
