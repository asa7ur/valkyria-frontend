import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {AuthResponse, LoginRequest} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  currentUser = signal<AuthResponse | null>(this.getUserFromStorage());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response));
        this.currentUser.set(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
  }

  private getUserFromStorage(): AuthResponse | null {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }
}
