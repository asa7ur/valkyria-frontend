import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Artist} from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})

export class ArtistService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/artists`);
  }
}
