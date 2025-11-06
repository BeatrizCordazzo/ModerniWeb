import { Component } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Datos } from '../datos';

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
  isSubmitting = false;
  submitError = '';

  formData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  constructor(private datosService: Datos) {}

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

    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    this.datosService.sendContactMessage(this.formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formSubmitted = true;
        setTimeout(() => {
          this.formSubmitted = false;
        }, 3000);
        this.formData = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        };
      },
      error: (err) => {
        console.error('Error sending contact message', err);
        this.isSubmitting = false;
        this.submitError = 'There was an error sending your message. Please try again.';
      }
    });
  }
}
