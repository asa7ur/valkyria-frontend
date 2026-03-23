import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root',
})
export class PerformanceApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/performances';

  /**
   * Obtiene actuaciones paginadas y filtradas.
   * @param page Número de página (0-based)
   * @param itemsPerPage Cantidad de elementos por página
   * @param search Término de búsqueda (artista o escenario)
   */
  getPerformances(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<Performance[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<Performance[]>>(this.apiUrl, {params});
  }

  /**
   * Obtiene una actuación específica por su ID.
   */
  getPerformanceById(id: string): Observable<ResponseDTO<Performance>> {
    return this.http.get<ResponseDTO<Performance>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva actuación en el sistema.
   * @param performanceData Objeto con artistId, stageId, startTime y endTime.
   */
  createPerformance(performanceData: any): Observable<ResponseDTO<Performance>> {
    return this.http.post<ResponseDTO<Performance>>(this.apiUrl, performanceData);
  }

  /**
   * Actualiza una actuación existente.
   */
  updatePerformance(id: number, performanceData: any): Observable<ResponseDTO<Performance>> {
    return this.http.put<ResponseDTO<Performance>>(`${this.apiUrl}/${id}`, performanceData);
  }

  /**
   * Elimina una actuación del programa.
   */
  deletePerformance(id: number): Observable<ResponseDTO<void>> {
    return this.http.delete<ResponseDTO<void>>(`${this.apiUrl}/${id}`);
  }
}
