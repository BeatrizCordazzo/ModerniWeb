import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatMenuModule,FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Moderni');
  searchQuery = signal('');

  onSearch() {
    console.log('Buscando:', this.searchQuery());
    // Aquí puedes implementar la lógica de búsqueda
  }

  navigateTo(section: string) {
    console.log('Navegando a:', section);
    // Aquí puedes implementar la navegación
  }
}
