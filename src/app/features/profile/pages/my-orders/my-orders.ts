import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderService} from '../../../../core/services/order.service';
import {OrderResponse} from '../../../../core/models/order.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html'
})
export class MyOrders implements OnInit {
  private orderService = inject(OrderService);

  // Usamos signals para asegurar la actualización de la UI
  orders = signal<OrderResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        console.log('Pedidos recibidos:', data);
        this.orders.set(data); // Actualizamos el signal
        this.loading.set(false); // La UI reaccionará instantáneamente
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);
      }
    });
  }
}
