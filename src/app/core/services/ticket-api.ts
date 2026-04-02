import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Ticket, TicketCreateDTO} from '../models/ticket';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class TicketApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/tickets';

  /**
   * Obtiene la página de tickets con búsqueda opcional
   */
  getTickets(page: number = 0, itemsPerPage: number = 10, search?: string): Observable<ResponseDTO<Ticket[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<Ticket[]>>(this.apiUrl, {params});
  }

  /**
   * Obtiene un ticket por ID para edición
   */
  getTicketById(id: number): Observable<ResponseDTO<Ticket>> {
    return this.http.get<ResponseDTO<Ticket>>(`${this.apiUrl}/${id}`);
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
