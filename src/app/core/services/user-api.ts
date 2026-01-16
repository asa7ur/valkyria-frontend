import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user';
import {PageResponse} from '../models/page-response';

@Injectable({providedIn: 'root'})
export class UserApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/users';

  getUsers(page: number = 0, size: number = 10, search: string = ''): Observable<PageResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<User>>(this.apiUrl, {params});
  }

  // Obtener un usuario por ID para cargar el formulario
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Actualizar usuario (usa UserRegistrationDTO en el backend)
  updateUser(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
