import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, tap} from 'rxjs'; // Añadimos 'of' y 'tap'
import {CampingType, TicketType} from '../models/ticket-types';

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
    return this.http.get<TicketType[]>(this.ticketApiUrl).pipe(
      tap(types => this.ticketTypesCache = types) // Guarda la respuesta en la caché
    );
  }

  /**
   * Obtiene los tipos de camping.
   * También implementa caché para evitar esperas innecesarias.
   */
  getCampingTypes(): Observable<CampingType[]> {
    if (this.campingTypesCache) {
      return of(this.campingTypesCache); // Devuelve la caché
    }
    return this.http.get<CampingType[]>(this.campingApiUrl).pipe(
      tap(types => this.campingTypesCache = types) // Guarda la respuesta en la caché
    );
  }

  /**
   * Opcional: Método para limpiar la caché si fuera necesario
   * (por ejemplo, al cerrar sesión o tras una compra con éxito)
   */
  clearCache() {
    this.ticketTypesCache = null;
    this.campingTypesCache = null;
  }
}
