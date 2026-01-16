import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Artist} from '../models/artist';
import {PageResponse} from '../models/page-response';

@Injectable({providedIn: 'root'})
export class ArtistApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/artists';

  /**
   * Obtiene artistas paginados y filtrados.
   * @param page Número de página (0-based)
   * @param size Cantidad de elementos por página
   * @param search Término de búsqueda (mapeado a @RequestParam search en el backend)
   */
  getArtists(page: number = 0, size: number = 10, search: string = ''): Observable<PageResponse<Artist>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<Artist>>(this.apiUrl, {params});
  }

  getArtistById(id: string): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`);
  }

  updateArtist(id: number, artistData: any): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/${id}`, artistData);
  }

  deleteArtist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
