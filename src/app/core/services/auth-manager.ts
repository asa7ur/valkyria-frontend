import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {AuthResponse, LoginRequest, RegisterRequest} from '../models/auth-payments';

@Injectable({
  providedIn: 'root'
})
export class AuthManager {
  private http = inject(HttpClient);
  // Base URL que coincide con @RequestMapping("/api/sessionGate") de tu controlador
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  currentUser = signal<AuthResponse | null>(this.getUserFromStorage());

  /**
   * Realiza el login enviando las credenciales al backend.
   * Procesa la respuesta que contiene el JWT y los datos del usuario.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true // <--- Necesario para recibir la cookie 'jwt' del backend
    }).pipe(
      tap(response => {
        this.saveSession(response);
      })
    );
  }

  /**
   * Envía los datos de registro al nuevo endpoint REST del backend.
   * A diferencia del login, este no siempre inicia sesión automáticamente
   * si el usuario nace desactivado (enabled: false).
   */
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  /**
   * Elimina los datos de sesión del almacenamiento local y resetea el estado.
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
  }

  /**
   * Verifica si el usuario tiene una sesión activa.
   */
  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  /**
   * Centraliza el guardado de la sesión tras el login o registro exitoso.
   */
  private saveSession(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_data', JSON.stringify(response));
    this.currentUser.set(response);
  }

  /**
   * Recupera los datos del usuario desde el almacenamiento persistente al iniciar la app.
   */
  private getUserFromStorage(): AuthResponse | null {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Envía el token de activación al backend para habilitar la cuenta del usuario.
   */
  confirmAccount(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/confirm?token=${token}`);
  }
}
