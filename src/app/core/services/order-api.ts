import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {OrderDTO} from '../models/order-schema';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class OrderApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  /**
   * Obtiene pedidos paginados y filtrados.
   * @param page Número de página (0-based)
   * @param itemsPerPage Cantidad de elementos por página
   * @param search Término de búsqueda (mapeado a @RequestParam search en el backend)
   */
  getOrders(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<OrderDTO[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<OrderDTO[]>>(this.apiUrl, {params});
  }

  getOrderById(id: string): Observable<ResponseDTO<OrderDTO>> {
    return this.http.get<ResponseDTO<OrderDTO>>(`${this.apiUrl}/${id}`);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
