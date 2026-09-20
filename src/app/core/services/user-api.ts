import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User, UserCreate, PasswordChange, AdminPasswordReset} from '../models/user';
import {AuthResponse} from '../models/auth-payments';
import {ResponseDTO} from '../models/response-dto';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class UserApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/users`;

  getMe(): Observable<ResponseDTO<User>> {
    return this.http.get<ResponseDTO<User>>(`${this.apiUrl}/me`);
  }

  updateMe(dto: {firstName: string; lastName: string; phone: string; birthDate: string}): Observable<ResponseDTO<User>> {
    return this.http.put<ResponseDTO<User>>(`${this.apiUrl}/me`, dto);
  }

  // Devuelve una sesión nueva: los tokens anteriores dejan de valer al cambiar la contraseña
  changeMyPassword(data: PasswordChange): Observable<ResponseDTO<AuthResponse>> {
    return this.http.patch<ResponseDTO<AuthResponse>>(`${this.apiUrl}/me/password`, data);
  }

  requestEmailChange(newEmail: string): Observable<ResponseDTO<void>> {
    return this.http.post<ResponseDTO<void>>(`${this.apiUrl}/me/email`, {newEmail});
  }

  confirmEmailChange(token: string): Observable<ResponseDTO<void>> {
    return this.http.get<ResponseDTO<void>>(`${this.apiUrl}/me/email/confirm`, {params: {token}});
  }

  getUsers(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<User[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<User[]>>(this.apiUrl, {params});
  }

  getUserById(id: string | number): Observable<ResponseDTO<User>> {
    return this.http.get<ResponseDTO<User>>(`${this.apiUrl}/${id}`);
  }

  // El administrador crea un usuario: nace activo y con el rol USER
  createUser(data: UserCreate): Observable<ResponseDTO<User>> {
    return this.http.post<ResponseDTO<User>>(this.apiUrl, data);
  }

  // Actualiza datos básicos (el backend ignorará el campo password si se envía aquí)
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  // El administrador restablece la contraseña de un usuario (sin la actual)
  changePassword(id: number, data: AdminPasswordReset): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
