import {computed, effect, inject, Injectable, signal} from '@angular/core';
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

  // Inicializa el signal con lo que haya en localStorage
  private currentOrder = signal<OrderCreateDTO>(this.loadFromStorage());

  itemCount = computed(() => {
    const order = this.currentOrder();
    return (order.tickets?.length || 0) + (order.campings?.length || 0);
  })

  constructor() {
    // Cada vez que el signal cambie, lo guarda en localStorage automáticamente
    effect(() => {
      localStorage.setItem('valkyria_cart', JSON.stringify(this.currentOrder()));
    })
  }

  private loadFromStorage(): OrderCreateDTO {
    const saved = localStorage.getItem('valkyria_cart');
    return saved ? JSON.parse(saved) : { tickets: [], campings: [] };
  }

  setOrder(order: OrderCreateDTO) {
    this.currentOrder.set(order);
  }

  getOrder() {
    return this.currentOrder();
  }

  clearOrder() {
    this.currentOrder.set({tickets: [], campings: []});
    localStorage.removeItem('valkyria_cart');
  }

  createOrder(order: OrderCreateDTO): Observable<ResponseDTO<{ url: string }>> {
    return this.http.post<ResponseDTO<{ url: string }>>(this.apiUrl, order);
  }

  getUserOrders(): Observable<ResponseDTO<OrderDTO[]>> {
    return this.http.get<ResponseDTO<OrderDTO[]>>(`${this.apiUrl}/my-orders`);
  }

  downloadOrderPdf(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/download`, {
      responseType: 'blob'
    });
  }
}
