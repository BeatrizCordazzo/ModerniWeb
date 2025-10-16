import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Datos } from '../datos';

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss'
})
export class SignUp {
  signUpForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder, private router: Router, private datosService: Datos) {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, SignUp.passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: SignUp.passwordMatchValidator });
  }

  // Static custom validator for password requirements
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasMinLength = value.length >= 6;
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

      const valid = hasUpperCase && hasMinLength && hasNumber && hasSpecialChar;
      
      if (!valid) {
        return {
          passwordRequirements: {
            hasUpperCase,
            hasMinLength,
            hasNumber,
            hasSpecialChar
          }
        };
      }
      
      return null;
    };
  }

  // Static custom validator to check if passwords match
  static passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      const formData = this.signUpForm.value;
      
      // Llamar al servicio para registrar el usuario
      this.datosService.signup(
        formData.name, // nombre
        formData.email,
        formData.password
      ).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Usuario registrado exitosamente:', response.mensaje);
            // Navegar a la página de login después del registro exitoso
            this.router.navigate(['/login']);
          } else {
            console.error('Error en registro:', response.mensaje);
            // Aquí podrías mostrar un mensaje de error al usuario
            alert(response.mensaje);
          }
        },
        error: (error) => {
          console.error('Error en la petición de registro:', error);
          alert('Error al registrar usuario. Por favor, intenta de nuevo.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.signUpForm.markAllAsTouched();
    }
  }

  getPasswordErrors() {
    const passwordControl = this.signUpForm.get('password');
    if (passwordControl?.errors?.['passwordRequirements']) {
      return passwordControl.errors['passwordRequirements'];
    }
    return null;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
