import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { Datos, Product, ShowcaseProject } from '../datos';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string | null;
  route: string;
  type: 'Product' | 'Project' | 'Page';
  image?: string | null;
  price?: number | null;
  searchText: string;
}

@Component({
  selector: 'app-nav',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav implements OnInit {
  title = signal('Moderni');
  searchQuery = '';
  isAdmin = false;
  userName: string | null = null;

  drawerOpen = false;
  servicesOpen = false;
  projectsOpen = false;

  searchResults: SearchResult[] = [];
  showSearchResults = false;
  isLoadingSearch = false;
  private searchDataLoaded = false;
  private allSearchItems: SearchResult[] = [];

  private readonly staticEntries: SearchResult[] = [
    {
      id: 'page-services',
      title: 'All Services',
      subtitle: 'Explore our full catalog of services',
      route: '/services',
      type: 'Page',
      searchText: 'services service catalog all services custom projects design',
    },
    {
      id: 'page-projects',
      title: 'Projects Showcase',
      subtitle: 'See our latest custom work',
      route: '/projects-page',
      type: 'Page',
      searchText: 'projects showcase gallery kitchen bedroom bathroom livingroom others',
    },
    {
      id: 'page-contact',
      title: 'Contact Moderni',
      subtitle: 'Get in touch with our team',
      route: '/contact',
      type: 'Page',
      searchText: 'contact support email phone message help',
    },
  ];

  constructor(private datos: Datos, private router: Router) {}

  ngOnInit(): void {
    try {
      const stored = localStorage.getItem('loggedUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.isAdmin = parsed && parsed.rol === 'admin';
        this.userName = parsed?.nombre || parsed?.name || parsed?.email || null;
      }
    } catch {
      // ignore parse errors
    }
    this.prefetchSearchItems();
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.clearSearch();
      return;
    }
    this.onSearchChange();
  }

  onSearchChange(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }
    if (!this.searchDataLoaded && !this.isLoadingSearch) {
      this.prefetchSearchItems(query);
      return;
    }
    this.filterResults(query);
  }

  selectResult(result: SearchResult): void {
    this.router.navigate([result.route]).then(() => this.clearSearch());
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.servicesOpen = false;
    this.projectsOpen = false;
  }

  toggleServices(): void {
    this.servicesOpen = !this.servicesOpen;
  }

  toggleProjects(): void {
    this.projectsOpen = !this.projectsOpen;
  }

  private prefetchSearchItems(initialQuery?: string): void {
    if (this.searchDataLoaded || this.isLoadingSearch) return;
    this.isLoadingSearch = true;
    forkJoin({
      products: this.datos.getProducts().pipe(take(1)),
      showcase: this.datos.getShowcaseProjects().pipe(take(1)),
    }).subscribe({
      next: ({ products, showcase }) => {
        const productEntries = (products || []).map((product) => this.mapProductToResult(product));
        const projectEntries = (showcase || []).map((project) => this.mapProjectToResult(project));
        this.allSearchItems = [...productEntries, ...projectEntries, ...this.staticEntries];
        this.searchDataLoaded = true;
        this.isLoadingSearch = false;
        if (initialQuery) {
          this.filterResults(initialQuery);
        }
      },
      error: () => {
        this.isLoadingSearch = false;
      },
    });
  }

  private filterResults(query: string): void {
    const matches = this.allSearchItems.filter((item) => item.searchText.includes(query)).slice(0, 5);
    this.searchResults = matches;
    this.showSearchResults = true;
  }

  private mapProductToResult(product: Product): SearchResult {
    return {
      id: `product-${product.id}`,
      title: product.name,
      subtitle: product.description || product.collection || product.category || product.type,
      route: this.getProductRoute(product),
      type: 'Product',
      image: product.image,
      price: product.price,
      searchText: this.buildSearchText([
        product.name,
        product.description,
        product.category,
        product.collection,
        product.type,
      ]),
    };
  }

  private mapProjectToResult(project: ShowcaseProject): SearchResult {
    return {
      id: `project-${project.id}`,
      title: project.titulo,
      subtitle: null,
      route: this.getProjectRoute(project),
      type: 'Project',
      image: project.imagenes?.[0] || null,
      searchText: this.buildSearchText([
        project.titulo,
        project.descripcion,
        project.categoria,
        project.cliente,
        project.estilo,
        project.ubicacion,
      ]),
    };
  }

  private getProductRoute(product: Product): string {
    const category = (product.category || product.type || '').toLowerCase();
    if (category.includes('kitchen')) return '/services/kitchen';
    if (category.includes('bath')) return '/services/bathroom';
    if (category.includes('bed')) return '/services/bedroom';
    if (category.includes('living')) return '/services/livingroom';
    if (category.includes('other')) return '/services/others';
    return '/services';
  }

  private getProjectRoute(project: ShowcaseProject): string {
    const category = project.categoria ? project.categoria.toLowerCase() : '';
    if (category) {
      return `/projects-page/${category}`;
    }
    return '/projects-page';
  }

  private buildSearchText(parts: Array<string | null | undefined>): string {
    return parts
      .filter((part) => !!part)
      .map((part) => part!.toLowerCase())
      .join(' ');
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchResults = false;
    }
  }
}
