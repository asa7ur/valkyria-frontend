import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TicketType, TicketTypeCreateDTO} from '../models/ticket-types';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class TicketTypeApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/ticket-types';

  getAllTicketTypes(): Observable<ResponseDTO<TicketType[]>> {
    return this.http.get<ResponseDTO<TicketType[]>>(this.apiUrl);
  }

  getTicketTypeById(id: number): Observable<ResponseDTO<TicketType>> {
    return this.http.get<ResponseDTO<TicketType>>(`${this.apiUrl}/${id}`);
  }

  createTicketType(dto: TicketTypeCreateDTO): Observable<TicketType> {
    return this.http.post<TicketType>(this.apiUrl, dto);
  }

  updateTicketType(id: number, dto: TicketTypeCreateDTO): Observable<TicketType> {
    return this.http.put<TicketType>(`${this.apiUrl}/${id}`, dto);
  }

  deleteTicketType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
