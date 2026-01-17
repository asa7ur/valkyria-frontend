import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Camping, CampingCreateDTO} from '../models/camping';
import {PageResponse} from '../models/page-response';

@Injectable({
  providedIn: 'root'
})
export class CampingApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/campings';

  /**
   * Obtiene la página de campings con búsqueda opcional
   */
  getCampings(page: number = 0, size: number = 10, search?: string): Observable<PageResponse<Camping>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<Camping>>(this.apiUrl, {params});
  }

  /**
   * Obtiene un camping por ID para edición
   */
  getCampingById(id: number): Observable<Camping> {
    return this.http.get<Camping>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un camping manualmente (Cortesía/Gestión)
   */
  createCamping(camping: CampingCreateDTO): Observable<Camping> {
    return this.http.post<Camping>(this.apiUrl, camping);
  }

  /**
   * Actualiza un camping existente
   */
  updateCamping(id: number, camping: CampingCreateDTO): Observable<Camping> {
    return this.http.put<Camping>(`${this.apiUrl}/${id}`, camping);
  }

  /**
   * Elimina un camping
   */
  deleteCamping(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
