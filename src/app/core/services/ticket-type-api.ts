import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TicketType, TicketTypeCreateDTO} from '../models/ticket-types';
import {ResponseDTO} from '../models/response-dto';
import {Stage} from '../models/stage';

@Injectable({
  providedIn: 'root'
})
export class TicketTypeApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/ticket-types';

  getTicketTypes(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<TicketType[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<TicketType[]>>(this.apiUrl, {params});
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
