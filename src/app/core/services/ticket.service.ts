import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CampingType, TicketType} from '../models/ticket.model';

@Injectable({providedIn: 'root'})
export class TicketService {
  private http = inject(HttpClient);
  private ticketApiUrl = 'http://localhost:8080/api/ticket-types';
  private campingApiUrl = 'http://localhost:8080/api/camping-types';

  getTicketTypes(): Observable<TicketType[]> {
    return this.http.get<TicketType[]>(this.ticketApiUrl);
  }

  getCampingTypes(): Observable<CampingType[]> {
    return this.http.get<CampingType[]>(this.campingApiUrl);
  }
}
