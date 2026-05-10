import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map, catchError, tap, of} from 'rxjs';
import {AuthResponse, LoginRequest, RegisterRequest} from '../models/auth-payments';

@Injectable({
  providedIn: 'root'
})
export class AuthManager {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  currentUser = signal<AuthResponse | null>(this.getUserFromStorage());

  /**
   * Verifica si el usuario tiene una sesión activa.
   */
  isLoggedIn(): boolean {
    const user = this.currentUser();
    if (!user || !user.token) return false;

    return !this.isTokenExpired(user.token);
  }

  /**
   * Decodifica el JWT y comprueba el campo 'exp'.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      // Compara el tiempo actual (en segundos) con el de expiración
      return (Math.floor((new Date()).getTime() / 1000)) >= expiry;
    } catch (e) {
      return true; // Si hay error decodificando, lo tratamos como expirado
    }
  }

  /**
   * Recupera los datos del usuario validando el token al inicio.
   */
  private getUserFromStorage(): AuthResponse | null {
    const data = localStorage.getItem('user_data');
    if (!data) return null;

    const user: AuthResponse = JSON.parse(data);

    // Si al cargar la app el token ya caducó, limpiamos y devolvemos null
    if (this.isTokenExpired(user.token)) {
      this.logout();
      return null;
    }

    return user;
  }

  /**
   * Validar la sesión contra el servidor al iniciar la app.
   */
  verifySessionFromServer(): Observable<boolean> {
    if (!this.isLoggedIn()) return of(false);

    return this.http.get(`${this.apiUrl}/validate`).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

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
   * Centraliza el guardado de la sesión tras el login o registro exitoso.
   */
  private saveSession(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_data', JSON.stringify(response));
    this.currentUser.set(response);
  }


  /**
   * Envía el token de activación al backend para habilitar la cuenta del usuario.
   */
  confirmAccount(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/confirm?token=${token}`);
  }
}
