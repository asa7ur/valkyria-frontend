import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {forkJoin} from 'rxjs';

// Núcleo: Importaciones con nombres descriptivos
import {CheckoutLogic} from '../../../../core/services/checkout-logic';
import {TicketProvider} from '../../../../core/services/ticket-provider';
import {TicketType, CampingType} from '../../../../core/models/ticket-types';
import {OrderRequest} from '../../../../core/models/order-schema';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  // Variables de instancia con nombres limpios
  private cart = inject(CheckoutLogic);
  private provider = inject(TicketProvider);
  private router = inject(Router);

  order: OrderRequest | null = null;
  ticketTypes: TicketType[] = [];
  campingTypes: CampingType[] = [];
  total = 0;
  isLoading = true;

  ngOnInit() {
    // Obtenemos el estado actual del "carrito" desde la lógica de checkout
    this.order = this.cart.getOrder();

    if (!this.order || (this.order.tickets.length === 0 && this.order.campings.length === 0)) {
      this.router.navigate(['/purchase']);
      return;
    }

    // Cargamos los datos maestros a través del proveedor
    forkJoin({
      tickets: this.provider.getTicketTypes(),
      campings: this.provider.getCampingTypes()
    }).subscribe({
      next: (res) => {
        this.ticketTypes = res.tickets;
        this.campingTypes = res.campings;
        this.calculateTotal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.isLoading = false;
      }
    });
  }

  calculateTotal() {
    let subtotal = 0;

    this.order?.tickets.forEach(t => {
      const type = this.ticketTypes.find(tp => Number(tp.id) === Number(t.ticketTypeId));
      if (type) subtotal += type.price;
    });

    this.order?.campings.forEach(c => {
      const type = this.campingTypes.find(cp => Number(cp.id) === Number(c.campingTypeId));
      if (type) subtotal += type.price;
    });

    this.total = subtotal;
  }

  getTicketName(id: any): string {
    const found = this.ticketTypes.find(t => Number(t.id) === Number(id));
    return found ? found.name : 'Ticket no encontrado';
  }

  getCampingName(id: any): string {
    const found = this.campingTypes.find(c => Number(c.id) === Number(id));
    return found ? found.name : 'Camping no encontrado';
  }

  removeItem(type: 'ticket' | 'camping', index: number) {
    if (this.order) {
      if (type === 'ticket') this.order.tickets.splice(index, 1);
      else this.order.campings.splice(index, 1);

      // Actualizamos el estado persistente en la lógica de checkout
      this.cart.setOrder(this.order);
      this.calculateTotal();
    }
  }

  confirmAndPay() {
    if (this.order) {
      // Delegamos la creación del pedido a la lógica de negocio
      this.cart.createOrder(this.order).subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert(err.error?.message || 'Error al procesar el pago')
      });
    }
  }
}
