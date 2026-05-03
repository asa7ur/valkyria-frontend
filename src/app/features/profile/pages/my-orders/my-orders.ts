import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CheckoutLogic} from '../../../../core/services/checkout-logic';
import {OrderDTO} from '../../../../core/models/order-schema';
import {TicketProvider} from '../../../../core/services/ticket-provider';
import {TicketType, CampingType} from '../../../../core/models/ticket-types';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html'
})
export class MyOrders implements OnInit {
  private cart = inject(CheckoutLogic);
  private ticketProvider = inject(TicketProvider);

  // Uso de signals para una reactividad limpia en la interfaz de usuario
  orders = signal<OrderDTO[]>([]);
  ticketTypes = signal<TicketType[]>([]);
  campingTypes = signal<CampingType[]>([]);
  loading = signal(true);
  expandedOrderId = signal<number | null>(null);

  ngOnInit() {
    forkJoin({
      orders: this.cart.getUserOrders(),
      ticketTypes: this.ticketProvider.getTicketTypes(),
      campingTypes: this.ticketProvider.getCampingTypes()
    }).subscribe({
      next: (res) => {
        if (res.orders.success) {
          this.orders.set(res.orders.data);
        }
        this.ticketTypes.set(res.ticketTypes);
        this.campingTypes.set(res.campingTypes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);
      }
    });
  }

  toggleOrderDetails(orderId: number) {
    this.expandedOrderId.update(id => id === orderId ? null : orderId);
  }

  getTicketPrice(typeName: string): number {
    const type = this.ticketTypes().find(t => t.name === typeName);
    return type ? type.price : 0;
  }

  getCampingPrice(typeName: string): number {
    const type = this.campingTypes().find(t => t.name === typeName);
    return type ? type.price : 0;
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
