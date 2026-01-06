import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderService} from '../../../../core/services/order.service';
import {OrderResponse} from '../../../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule],
  templateUrl: './my-orders.html'
})
export class MyOrders implements OnInit {
  private orderService = inject(OrderService);
  orders: OrderResponse[] = [];
  loading = true;

  ngOnInit() {
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
