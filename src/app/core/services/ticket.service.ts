import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TicketType} from '../models/ticket.model';

@Injectable({providedIn: 'root'})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/tickets';

  getTicketTypes(): Observable<TicketType[]> {
    return this.http.get<TicketType[]>(this.apiUrl);
  }
}
