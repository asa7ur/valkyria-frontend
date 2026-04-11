import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User, PasswordChange} from '../models/user';
import {ResponseDTO} from '../models/response-dto';

@Injectable({providedIn: 'root'})
export class UserApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/users';

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

  // Actualiza datos básicos (el backend ignorará el campo password si se envía aquí)
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  // Nuevo método para el cambio de contraseña
  changePassword(id: number, data: PasswordChange): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
