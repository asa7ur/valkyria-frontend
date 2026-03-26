import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CheckoutLogic} from '../../../../core/services/checkout-logic';
import {OrderDTO} from '../../../../core/models/order-schema';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html'
})
export class MyOrders implements OnInit {
  private cart = inject(CheckoutLogic);

  // Uso de signals para una reactividad limpia en la interfaz de usuario
  orders = signal<OrderDTO[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.cart.getUserOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders.set(res.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);
      }
    });
  }

  downloadCredentials(orderId: number) {
    this.cart.downloadOrderPdf(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pedido_${orderId}.pdf`;
        link.click();
      }
    });
  }
}
