import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {OrderRequest} from '../models/order.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/orders';

  private currentOrder: OrderRequest | null = null;

  setOrder(order: OrderRequest) {
    this.currentOrder = order;
  }

  getOrder(): OrderRequest | null {
    return this.currentOrder;
  }

  createOrder(order: OrderRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, order);
  }
}
