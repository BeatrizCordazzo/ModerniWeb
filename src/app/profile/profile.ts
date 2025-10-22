import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Datos } from '../datos';
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
  imports: [Nav, Footer, CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  activeTab: 'credentials' | 'orders' | 'favorites' = 'credentials';
  user: User | null = null;
  originalUser: User | null = null;
  isLoading = true;
  notLogged = false;

  constructor(private router: Router, private datosService: Datos) {}

  ngOnInit(): void {
    this.datosService.getLoggedUser().subscribe({
      next: (user: any) => {
        if (user && user.email) {
          this.user = user;
          this.originalUser = { ...user };
          this.isLoading = false;
        } else {
          this.notLogged = true;
          this.isLoading = false;
        }
      },
      error: () => {
        this.notLogged = true;
        this.isLoading = false;
      }
    });
  }

  hasChanges(): boolean {
    return !!(this.user && this.originalUser && JSON.stringify(this.user) !== JSON.stringify(this.originalUser));
  }

  saveChanges(): void {
    if (this.user) {
      this.originalUser = { ...this.user };
      console.log('Changes saved:', this.user);
    }
  }

  orders: Order[] = [
    {
      id: 1001,
      date: 'October 15, 2025',
      status: 'delivered',
      items: [
        {
          name: 'Modern Dining Table',
          quantity: 1,
          price: 45000,
          image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200'
        },
        {
          name: 'Chairs (Set of 6)',
          quantity: 1,
          price: 32000,
          image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200'
        }
      ],
      total: 77000
    },
    {
      id: 1002,
      date: 'October 10, 2025',
      status: 'processing',
      items: [
        {
          name: 'Office Desk',
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
      name: 'Scandinavian Armchair',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300'
    },
    {
      id: 2,
      name: 'Floor Lamp',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300'
    },
    {
      id: 3,
      name: 'Modular Shelving',
      price: 42000,
      image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=300'
    }
  ];

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return statusMap[status] || status;
  }

  removeFavorite(id: number): void {
    this.favorites = this.favorites.filter(item => item.id !== id);
  }
}
