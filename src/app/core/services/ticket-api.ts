import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Ticket, TicketCreateDTO} from '../models/ticket';
import {PageResponse} from '../models/page-response';

@Injectable({
  providedIn: 'root'
})
export class TicketApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/tickets';

  /**
   * Obtiene la página de tickets con búsqueda opcional
   */
  getTickets(page: number = 0, size: number = 10, search?: string): Observable<PageResponse<Ticket>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<Ticket>>(this.apiUrl, {params});
  }

  /**
   * Obtiene un ticket por ID para edición
   */
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un ticket manualmente (Cortesía/Gestión)
   */
  createTicket(ticket: TicketCreateDTO): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  /**
   * Actualiza un ticket existente
   */
  updateTicket(id: number, ticket: TicketCreateDTO): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket);
  }

  /**
   * Elimina un ticket
   */
  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
