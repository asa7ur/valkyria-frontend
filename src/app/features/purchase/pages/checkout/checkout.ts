import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { CheckoutLogic } from '../../../../core/services/checkout-logic';
import { TicketProvider } from '../../../../core/services/ticket-provider';
import { AuthManager } from '../../../../core/services/auth-manager';
import { OrderCreateDTO } from '../../../../core/models/order-schema';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.html'
})

export class Checkout {
  private cart = inject(CheckoutLogic);
  private provider = inject(TicketProvider);
  private auth = inject(AuthManager);

  currentUser = this.auth.currentUser;
  guestEmail = signal('');

  ticketTypes = toSignal(this.provider.getTicketTypes(), { initialValue: [] });
  campingTypes = toSignal(this.provider.getCampingTypes(), { initialValue: [] });

  order = computed(() => this.cart.getOrder());

  total = computed(() => {
    let subtotal = 0;
    const currentOrder = this.order();
    const tickets = this.ticketTypes();
    const campings = this.campingTypes();

    // Acceso directo .tickets ya que el DTO garantiza el array
    currentOrder.tickets.forEach(t => {
      const type = tickets.find(tp => Number(tp.id) === Number(t.ticketTypeId));
      if (type) subtotal += type.price;
    });

    currentOrder.campings.forEach(c => {
      const type = campings.find(cp => Number(cp.id) === Number(c.campingTypeId));
      if (type) subtotal += type.price;
    });

    return subtotal;
  });

  isLoading = computed(() => this.ticketTypes().length === 0 && this.campingTypes().length === 0);

  getTicketName(id: any): string {
    const found = this.ticketTypes().find(t => Number(t.id) === Number(id));
    return found ? found.name : $localize`:@@checkout.error.ticketNotFound:Ticket no encontrado`;
  }

  getCampingName(id: any): string {
    const found = this.campingTypes().find(c => Number(c.id) === Number(id));
    return found ? found.name : $localize`:@@checkout.error.campingNotFound:Camping no encontrado`;
  }

  removeItem(type: 'ticket' | 'camping', index: number) {
    const currentOrder = this.order();

    const updatedOrder: OrderCreateDTO = {
      ...currentOrder,
      tickets: [...currentOrder.tickets],
      campings: [...currentOrder.campings]
    };

    if (type === 'ticket') {
      updatedOrder.tickets.splice(index, 1);
    } else {
      updatedOrder.campings.splice(index, 1);
    }

    this.cart.setOrder(updatedOrder);
  }

  confirmAndPay() {
    const currentOrder = this.order();

    if (!this.currentUser()) {
      if (!this.guestEmail()) {
        alert($localize`:@@checkout.error.emailRequired:Por favor, introduce un email`);
        return;
      }
      currentOrder.guestEmail = this.guestEmail();
    }

    this.cart.createOrder(currentOrder).subscribe({
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
