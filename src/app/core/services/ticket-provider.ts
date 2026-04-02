import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, tap} from 'rxjs'; // Añadimos 'of' y 'tap'
import {CampingType, TicketType} from '../models/ticket-types';
import {ResponseDTO} from '../models/response-dto';

@Injectable({providedIn: 'root'})
export class TicketProvider {
  private http = inject(HttpClient);
  private ticketApiUrl = 'http://localhost:8080/api/v1/ticket-types';
  private campingApiUrl = 'http://localhost:8080/api/v1/camping-types';

  // Variables para guardar los datos en memoria (Caché)
  private ticketTypesCache: TicketType[] | null = null;
  private campingTypesCache: CampingType[] | null = null;

  /**
   * Obtiene los tipos de entradas.
   * Si ya se descargaron antes, los devuelve al instante.
   */
  getTicketTypes(): Observable<TicketType[]> {
    if (this.ticketTypesCache) {
      return of(this.ticketTypesCache); // Devuelve la caché
    }
    return this.http.get<ResponseDTO<TicketType[]>>(this.ticketApiUrl).pipe(
      map(response => response.data),
      tap(types => this.ticketTypesCache = types)
    );
  }

  /**
   * Obtiene los tipos de camping.
   * También implementa caché para evitar esperas innecesarias.
   */
  getCampingTypes(): Observable<CampingType[]> {
    if (this.campingTypesCache) {
      return of(this.campingTypesCache);
    }

    return this.http.get<ResponseDTO<CampingType[]>>(this.campingApiUrl).pipe(
      map(response => response.data),
      tap(types => this.campingTypesCache = types)
    );
  }
}
