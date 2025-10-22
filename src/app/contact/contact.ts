import { Component } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  imports: [Nav, Footer, CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  formSubmitted = false;
  
  formData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isFormValid(): boolean {
    return !!(
      this.formData.name.trim() &&
      this.formData.email.trim() &&
      this.formData.phone.trim() &&
      this.formData.message.trim()
    );
  }

  onSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.isFormValid()) {
      return;
    }
    
    console.log('Form submitted:', this.formData);
    
    // Aquí iría la lógica para enviar el formulario
    // Por ahora solo mostramos el mensaje de éxito
    this.formSubmitted = true;
    
    // Resetear el formulario después de 3 segundos
    setTimeout(() => {
      this.formSubmitted = false;
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };
    }, 3000);
  }
}
