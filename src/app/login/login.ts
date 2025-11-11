import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Datos } from '../datos';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  returnUrl: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private datosService: Datos, private route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Read optional returnUrl query param (e.g. /login?returnUrl=/profile)
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // If user already logged in, redirect immediately to returnUrl or profile
    this.datosService.getLoggedUser().subscribe({
      next: (user: any) => {
        if (user && user.email) {
          const dest = this.returnUrl || '/profile';
          this.router.navigate([dest]);
        }
      },
      error: () => {
        // ignore errors here; user will see login form
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      
      // Usar el email para el login
      this.datosService.login(formData.email, formData.password).subscribe({
        next: (response: any) => {
          if (response.success) {
            console.log('Login exitoso:', response.mensaje);
            // Confirm the server-side cookie/session by requesting the logged user
            // If backend returned user in the login response, store it locally for immediate use
            if ((response as any).user) {
              try {
                localStorage.setItem('loggedUser', JSON.stringify((response as any).user));
              } catch (e) {
                console.warn('No se pudo guardar usuario en localStorage:', e);
              }
            }

            // Try to validate server-side session; if it fails, fallback to localStorage data
            this.datosService.getLoggedUser().subscribe({
              next: (user: any) => {
                if (user && user.email) {
                  const dest = this.returnUrl || '/profile';
                  this.router.navigate([dest]);
                } else {
                  // Fallback to localStorage
                  const stored = localStorage.getItem('loggedUser');
                  if (stored) {
                    const dest = this.returnUrl || '/profile';
                    this.router.navigate([dest]);
                  } else {
                    alert('Inicio de sesión registrado, pero no se pudo validar la sesión en el servidor. Intenta recargar.');
                  }
                }
              },
              error: (err) => {
                console.error('Error validando sesión tras login:', err);
                // On error, try localStorage fallback
                const stored = localStorage.getItem('loggedUser');
                if (stored) {
                  const dest = this.returnUrl || '/profile';
                  this.router.navigate([dest]);
                } else {
                  alert('Inicio de sesión registrado, pero no se pudo validar la sesión. Intenta recargar la página.');
                }
              }
            });
          } else {
            console.error('Error en login:', response.mensaje);
            alert(response.mensaje);
          }
        },
        error: (error) => {
          console.error('Error en la petición de login:', error);
          alert('Error al iniciar sesión. Por favor, intenta de nuevo.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
