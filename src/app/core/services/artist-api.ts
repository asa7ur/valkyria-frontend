import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Artist} from '../models/artist';

@Injectable({providedIn: 'root'})
export class ArtistApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/artists';

  getAllArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/all`);
  }

  getArtists(): Observable<Artist[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.content)
    );
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
