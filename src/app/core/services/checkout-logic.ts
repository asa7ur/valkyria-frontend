import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {OrderRequest, OrderResponse} from '../models/order-schema';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutLogic {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/orders';

  // Usamos un signal para que cualquier componente sepa si hay un pedido pendiente
  private currentOrder = signal<OrderRequest | null>(null);

  setOrder(order: OrderRequest) {
    this.currentOrder.set(order);
  }

  getOrder() {
    return this.currentOrder();
  }

  /**
   * Envía el formulario de compra al servidor.
   * El servidor responderá con el ID del pedido o la URL de Stripe.
   */
  createOrder(order: OrderRequest): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(this.apiUrl, order);
  }

  clearOrder() {
    this.currentOrder.set(null);
  }

  getUserOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/my-orders`);
  }
}
