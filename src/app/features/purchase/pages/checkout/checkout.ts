import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { CheckoutLogic } from '../../../../core/services/checkout-logic';
import { TicketProvider } from '../../../../core/services/ticket-provider';
import { AuthManager } from '../../../../core/services/auth-manager';
import { OrderCreateDTO } from '../../../../core/models/order-schema';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './checkout.html'
})
export class Checkout {
  private cart = inject(CheckoutLogic);
  private provider = inject(TicketProvider);
  private auth = inject(AuthManager);

  currentUser = this.auth.currentUser;
  guestEmail = signal('');

  // Usamos toSignal para manejar las peticiones asíncronas como estados reactivos puros
  ticketTypes = toSignal(this.provider.getTicketTypes(), { initialValue: [] });
  campingTypes = toSignal(this.provider.getCampingTypes(), { initialValue: [] });

  order = computed(() => this.cart.getOrder());

  // Total solo de las entradas
  ticketsTotal = computed(() => {
    const currentOrder = this.order();
    const types = this.ticketTypes();
    return currentOrder.tickets.reduce((sum, t) => {
      const found = types.find(tp => Number(tp.id) === Number(t.ticketTypeId));
      return sum + (found?.price || 0);
    }, 0);
  });

// Total solo del camping
  campingsTotal = computed(() => {
    const currentOrder = this.order();
    const types = this.campingTypes();
    return currentOrder.campings.reduce((sum, c) => {
      const found = types.find(cp => Number(cp.id) === Number(c.campingTypeId));
      return sum + (found?.price || 0);
    }, 0);
  });

// Suma final de ambos
  grandTotal = computed(() => this.ticketsTotal() + this.campingsTotal());

  isLoading = computed(() => this.ticketTypes().length === 0 && this.campingTypes().length === 0);

  getTicketName(id: any): string {
    const found = this.ticketTypes().find(t => Number(t.id) === Number(id));
    return found ? found.name : 'Ticket';
  }

  getCampingName(id: any): string {
    const found = this.campingTypes().find(c => Number(c.id) === Number(id));
    return found ? found.name : 'Alojamiento';
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
    const currentOrder = { ...this.order() }; // Clonamos para evitar mutaciones directas

    if (!this.currentUser()) {
      if (!this.guestEmail() || !this.guestEmail().includes('@')) {
        alert('Por favor, introduce un email válido');
        return;
      }
      currentOrder.guestEmail = this.guestEmail();
    }

    this.cart.createOrder(currentOrder).subscribe({
      next: (res) => {
        if (res.success && res.data?.url) {
          window.location.href = res.data.url;
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Error al procesar el pago');
      }
    });
  }
}
