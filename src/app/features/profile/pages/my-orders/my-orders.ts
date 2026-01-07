import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CheckoutLogic} from '../../../../core/services/checkout-logic';
import {OrderResponse} from '../../../../core/models/order-schema';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html'
})
export class MyOrders implements OnInit {
  // Inyección de la lógica de pedidos con un nombre semántico ('cart' o 'orders')
  private cart = inject(CheckoutLogic);

  // Uso de signals para una reactividad limpia en la interfaz de usuario
  orders = signal<OrderResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    // Obtenemos el historial de pedidos del usuario a través de la lógica de checkout
    this.cart.getUserOrders().subscribe({
      next: (data) => {
        console.log('Pedidos recibidos:', data);
        this.orders.set(data); // Actualizamos el estado de forma reactiva
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar los pedidos:', err);
        this.loading.set(false);
      }
    });
  }
}
