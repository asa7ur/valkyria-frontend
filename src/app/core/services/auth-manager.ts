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

  /**
   * Signal que mantiene el estado del usuario actual.
   * Se inicializa recuperando los datos del almacenamiento local.
   */
  currentUser = signal<AuthResponse | null>(this.getUserFromStorage());

  /**
   * Verifica si el usuario tiene una sesión activa y válida.
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
   * Se ha modificado para evitar llamar a logout() directamente durante la inicialización,
   * lo que causaba un error de dependencia circular al intentar acceder al signal.
   */
  private getUserFromStorage(): AuthResponse | null {
    const data = localStorage.getItem('user_data');
    if (!data) return null;

    const user: AuthResponse = JSON.parse(data);

    // Si al cargar la app el token ya caducó, limpiamos el storage y devolvemos null
    if (this.isTokenExpired(user.token)) {
      this.clearStorage();
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
   */
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  /**
   * Elimina los datos de sesión del almacenamiento local y resetea el estado del signal.
   */
  logout(): void {
    this.clearStorage();
    this.currentUser.set(null);
  }

  /**
   * Método privado para centralizar la limpieza de localStorage.
   */
  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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
