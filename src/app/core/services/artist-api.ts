import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Artist, ArtistCreateDTO, ArtistImage} from '../models/artist';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class ArtistApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/artists';
  public readonly imagesBaseUrl = 'http://localhost:8080/uploads/artists';

  /**
   * Obtiene artistas paginados y filtrados.
   * @param page Número de página (0-based)
   * @param itemsPerPage Cantidad de elementos por página
   * @param search Término de búsqueda (mapeado a @RequestParam search en el backend)
   */
  getArtists(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<Artist[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<Artist[]>>(this.apiUrl, {params});
  }

  getArtistById(id: string): Observable<ResponseDTO<Artist>> {
    return this.http.get<ResponseDTO<Artist>>(`${this.apiUrl}/${id}`);
  }

  createArtist(artistData: ArtistCreateDTO): Observable<ResponseDTO<Artist>> {
    return this.http.post<ResponseDTO<Artist>>(this.apiUrl, artistData);
  }

  updateArtist(id: number, artistData: ArtistCreateDTO): Observable<ResponseDTO<Artist>> {
    return this.http.put<ResponseDTO<Artist>>(`${this.apiUrl}/${id}`, artistData);
  }

  deleteArtist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadLogo(id: number, file: File): Observable<ResponseDTO<{ fileName: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ResponseDTO<{ fileName: string }>>(`${this.apiUrl}/${id}/logo`, formData);
  }

  uploadImages(id: number, files: File[]): Observable<ResponseDTO<ArtistImage[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<ResponseDTO<ArtistImage[]>>(`${this.apiUrl}/${id}/images`, formData);
  }

  deleteLogo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/logo`);
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/images/${imageId}`);
  }
}
