import { Component } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  memberSince: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
}

interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-profile',
  imports: [Nav, Footer, CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  activeTab: 'credentials' | 'orders' | 'favorites' = 'credentials';

  user: User = {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+54 9 11 1234-5678',
    address: 'Av. Corrientes 1234, CABA',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&size=200&background=667eea&color=fff',
    memberSince: 'Enero 2024'
  };

  orders: Order[] = [
    {
      id: 1001,
      date: '15 de Octubre, 2025',
      status: 'delivered',
      items: [
        {
          name: 'Mesa de Comedor Moderna',
          quantity: 1,
          price: 45000,
          image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200'
        },
        {
          name: 'Sillas (Set de 6)',
          quantity: 1,
          price: 32000,
          image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200'
        }
      ],
      total: 77000
    },
    {
      id: 1002,
      date: '10 de Octubre, 2025',
      status: 'processing',
      items: [
        {
          name: 'Escritorio de Oficina',
          quantity: 1,
          price: 28000,
          image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200'
        }
      ],
      total: 28000
    }
  ];

  favorites: FavoriteItem[] = [
    {
      id: 1,
      name: 'Sillón Escandinavo',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300'
    },
    {
      id: 2,
      name: 'Lámpara de Pie',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300'
    },
    {
      id: 3,
      name: 'Estantería Modular',
      price: 42000,
      image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=300'
    }
  ];

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'En Proceso',
      'shipped': 'Enviado',
      'delivered': 'Entregado'
    };
    return statusMap[status] || status;
  }

  removeFavorite(id: number): void {
    this.favorites = this.favorites.filter(item => item.id !== id);
  }
}
