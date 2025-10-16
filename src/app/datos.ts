import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Datos {
  url = 'http://localhost/moderni/'

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const loginData = {
      email: email,
      password: password
    }
    return this.http.post(this.url + 'login.php', loginData)
  }

  signup(nombre: string, email: string, password: string, telefono?: string, rol: string = 'cliente'): Observable<any> {
    const signupData = {
      nombre: nombre,
      email: email,
      password: password,
      telefono: telefono,
      rol: rol
    }
    return this.http.post(this.url + 'signup.php', signupData)
  }
}