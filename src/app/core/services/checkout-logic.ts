import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {OrderCreateDTO, OrderDTO} from '../models/order-schema';
import {Observable} from 'rxjs';
import {ResponseDTO} from "../models/response-dto";

@Injectable({
  providedIn: 'root'
})
export class CheckoutLogic {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  // Usamos un signal para que cualquier componente sepa si hay un pedido pendiente
  private currentOrder = signal<OrderCreateDTO | null>(null);

  setOrder(order: OrderCreateDTO) {
    this.currentOrder.set(order);
  }

  getOrder() {
    return this.currentOrder();
  }

  /**
   * Envía el formulario de compra al servidor.
   * El servidor responderá con el ID del pedido o la URL de Stripe.
   */
  createOrder(order: OrderCreateDTO): Observable<ResponseDTO<{ url: string }>> {
    return this.http.post<ResponseDTO<{ url: string }>>(this.apiUrl, order);
  }

  clearOrder() {
    this.currentOrder.set(null);
  }

  /**
   * Obtiene el historial del usuario
   */
  getUserOrders(): Observable<ResponseDTO<OrderDTO[]>> {
    return this.http.get<ResponseDTO<OrderDTO[]>>(`${this.apiUrl}/my-orders`);
  }

  /**
   * Descarga el PDF de un pedido específico
   */
  downloadOrderPdf(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/download`, {
      responseType: 'blob'
    });
  }
}
