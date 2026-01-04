import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Artist, TicketType} from '../models/festival.models';

@Injectable({
  providedIn: 'root'
})

export class FestivalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.apiUrl}/artists`);
  }

  getTicketTypes(): Observable<TicketType[]> {
    return this.http.get<TicketType[]>(`${this.apiUrl}/tickets`);
  }
}
