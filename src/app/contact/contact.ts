import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Datos } from '../datos';
import { Footer } from '../footer/footer';
import { Nav } from '../nav/nav';
import { ConfirmationModal } from '../shared/confirmation-modal/confirmation-modal';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  imports: [Nav, Footer, FormsModule, ConfirmationModal],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements AfterViewInit, OnDestroy {
  formSubmitted = false;
  isSubmitting = false;
  submitError = '';

  //to control the modal
  showContactConfirmModal = false;

  private map: L.Map | null = null;
  readonly showroomLocation = {
    lat: 41.6523,
    lng: -4.7245,
    title: 'Moderni Showroom',
  };

  formData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  };

  constructor(private datosService: Datos) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
    setTimeout(() => this.initMap());
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.name.trim() &&
      this.formData.email.trim() &&
      this.formData.phone.trim() &&
      this.formData.message.trim()
    );
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }
    // Solo abrimos el modal de confirmación
    this.showContactConfirmModal = true;
  }

  onConfirmSendMessage(): void {
    this.showContactConfirmModal = false;
    this.sendContactMessage();
  }

  onCancelSendMessage(): void {
    this.showContactConfirmModal = false;
  }

  private sendContactMessage(): void {
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    this.datosService.sendContactMessage(this.formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formSubmitted = true;
        setTimeout(() => (this.formSubmitted = false), 3000);
        this.formData = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        };
      },
      error: (err) => {
        console.error('Error sending contact message', err);
        this.isSubmitting = false;
        this.submitError = 'There was an error sending your message. Please try again.';
      },
    });
  }

  private initMap(): void {
    if (this.map) {
      return;
    }
    const container = document.getElementById('moderni-map');
    if (!container) {
      return;
    }

    this.map = L.map(container, {
      center: [this.showroomLocation.lat, this.showroomLocation.lng],
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const markerIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.marker([this.showroomLocation.lat, this.showroomLocation.lng], {
      icon: markerIcon,
    })
      .addTo(this.map)
      .bindPopup(
        `<strong>${this.showroomLocation.title}</strong><br>Calle de la Catedral 123<br>Valladolid, España`
      );
  }
}
