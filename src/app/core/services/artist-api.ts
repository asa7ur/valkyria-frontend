import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ArtistApi {
  private http = inject(HttpClient);
  // Corregimos la URL base para incluir /v1/
  private apiUrl = 'http://localhost:8080/api/v1/artists';

  /**
   * Obtiene artistas con soporte para búsqueda y paginación del lado del servidor.
   */
  getArtists(search: string = '', page: number = 0, size: number = 9): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.apiUrl, {params});
  }

  getArtistById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
