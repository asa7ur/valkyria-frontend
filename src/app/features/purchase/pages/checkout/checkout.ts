import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {forkJoin} from 'rxjs';

import {CheckoutLogic} from '../../../../core/services/checkout-logic';
import {TicketProvider} from '../../../../core/services/ticket-provider';
import {TicketType, CampingType} from '../../../../core/models/ticket-types';
import {OrderCreateDTO} from '../../../../core/models/order-schema';
import {AuthManager} from '../../../../core/services/auth-manager';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  private cart = inject(CheckoutLogic);
  private provider = inject(TicketProvider);
  private router = inject(Router);
  private auth = inject(AuthManager);

  currentUser = this.auth.currentUser;
  guestEmail = signal('');

  order: OrderCreateDTO | null = null;
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
    return found ? found.name : $localize`:@@checkout.error.ticketNotFound:Ticket no encontrado`;
  }

  getCampingName(id: any): string {
    const found = this.campingTypes.find(c => Number(c.id) === Number(id));
    return found ? found.name : $localize`:@@checkout.error.campingNotFound:Camping no encontrado`;
  }

  removeItem(type: 'ticket' | 'camping', index: number) {
    if (!this.order) return;

    const updatedOrder: OrderCreateDTO = {
      ...this.order,
      tickets: [...this.order.tickets],
      campings: [...this.order.campings]
    };

    if (type === 'ticket') {
      updatedOrder.tickets = updatedOrder.tickets.filter((_, i) => i !== index);
    } else {
      updatedOrder.campings = updatedOrder.campings.filter((_, i) => i !== index);
    }

    // Actualiza el servicio (esto disparará el Signal y actualizará el header/localStorage)
    this.cart.setOrder(updatedOrder);

    // Actualiza la referencia local para que la vista del checkout se refresque
    this.order = updatedOrder;
    this.calculateTotal();

    // Si la cesta se queda vacía, redirige automáticamente a la selección
    if (updatedOrder.tickets.length === 0 && updatedOrder.campings.length === 0) {
      this.router.navigate(['/purchase']);
    }
  }

  confirmAndPay() {
    if (this.order) {
      // Si no hay usuario logueado, validamos y asignamos email de invitado
      if (!this.currentUser()) {
        if (!this.guestEmail()) {
          alert($localize`:@@checkout.error.emailRequired:Por favor, introduce un email`);
          return;
        }
        this.order.guestEmail = this.guestEmail();
      }

      this.cart.createOrder(this.order).subscribe({
        next: (res) => {
          if (res.success && res.data.url) {
            window.location.href = res.data.url;
          }
        },
        error: (err) => {
          alert(err.error?.message || $localize`:@@checkout.error.paymentProcessing:Error al procesar el pago`);
        }
      });
    }
  }
}
