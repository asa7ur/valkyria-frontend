import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {OrderService} from '../../../../core/services/order.service';
import {TicketService} from '../../../../core/services/ticket.service';
import {TicketType, CampingType} from '../../../../core/models/ticket.model';
import {OrderRequest} from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  private orderService = inject(OrderService);
  private ticketService = inject(TicketService);
  private router = inject(Router);

  order: OrderRequest | null = null;
  ticketTypes: TicketType[] = [];
  campingTypes: CampingType[] = [];
  total = 0;

  ngOnInit() {
    this.order = this.orderService.getOrder();

    // Si el usuario entra aquí sin haber rellenado datos, lo devolvemos
    if (!this.order || (this.order.tickets.length === 0 && this.order.campings.length === 0)) {
      this.router.navigate(['/purchase']);
      return;
    }

    // Cargamos los tipos para calcular precios reales del lado del cliente
    this.ticketService.getTicketTypes().subscribe(types => {
      this.ticketTypes = types;
      this.calculateTotal();
    });
    this.ticketService.getCampingTypes().subscribe(types => {
      this.campingTypes = types;
      this.calculateTotal();
    });
  }

  calculateTotal() {
    let subtotal = 0;
    this.order?.tickets.forEach(t => {
      const type = this.ticketTypes.find(tp => tp.id === t.ticketTypeId);
      if (type) subtotal += type.price;
    });
    this.order?.campings.forEach(c => {
      const type = this.campingTypes.find(cp => cp.id === c.campingTypeId);
      if (type) subtotal += type.price;
    });
    this.total = subtotal;
  }

  getTicketName(id: number): string {
    return this.ticketTypes.find(t => t.id === id)?.name || 'Cargando...';
  }

  getCampingName(id: number): string {
    return this.campingTypes.find(c => c.id === id)?.name || 'Cargando...';
  }

  removeItem(type: 'ticket' | 'camping', index: number) {
    if (this.order) {
      if (type === 'ticket') this.order.tickets.splice(index, 1);
      else this.order.campings.splice(index, 1);

      this.orderService.setOrder(this.order);
      this.calculateTotal();
    }
  }

  confirmAndPay() {
    if (this.order) {
      this.orderService.createOrder(this.order).subscribe({
        next: (res) => window.location.href = res.url, // Redirección final a Stripe
        error: (err) => alert(err.error?.message || 'Error al procesar el pago')
      });
    }
  }
}
