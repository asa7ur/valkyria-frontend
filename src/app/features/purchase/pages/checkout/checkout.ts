import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { CheckoutLogic } from '../../../../core/services/checkout-logic';
import { TicketProvider } from '../../../../core/services/ticket-provider';
import { AuthManager } from '../../../../core/services/auth-manager';
import { OrderCreateDTO } from '../../../../core/models/order-schema';
import { CampingType, TicketType } from '../../../../core/models/ticket-types';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {LegalConsent} from '../../../../shared/components/legal-consent/legal-consent';
import {LocalizedNamePipe} from '../../../../shared/pipes/localized-name.pipe';
import {splitName} from '../../../../shared/utils/name-utils';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, LegalConsent, LocalizedNamePipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private cart = inject(CheckoutLogic);
  private provider = inject(TicketProvider);
  private auth = inject(AuthManager);
  private translate = inject(TranslateService);

  currentUser = this.auth.currentUser;
  guestEmail = signal('');

  // Mientras se crea el pedido y se redirige a Stripe: evita pagar dos veces con un doble clic
  protected readonly isPaying = signal(false);
  // Error que se enseña encima del botón (la web pública no tiene toasts). Si el backend manda un mensaje
  // (p. ej. sin stock, ya traducido), se usa ese
  protected readonly error = signal<string | null>(null);

  protected readonly splitName = splitName;

  // Usamos toSignal para manejar las peticiones asíncronas como estados reactivos puros
  ticketTypes = toSignal(this.provider.getTicketTypes(), { initialValue: [] });
  campingTypes = toSignal(this.provider.getCampingTypes(), { initialValue: [] });

  order = computed(() => this.cart.getOrder());

  // Total solo de las entradas
  ticketsTotal = computed(() => {
    const currentOrder = this.order();
    return currentOrder.tickets.reduce((sum, t) => sum + (this.ticketType(t.ticketTypeId)?.price || 0), 0);
  });

  // Total solo del camping
  campingsTotal = computed(() => {
    const currentOrder = this.order();
    return currentOrder.campings.reduce((sum, c) => sum + (this.campingType(c.campingTypeId)?.price || 0), 0);
  });

  // Suma final de ambos
  grandTotal = computed(() => this.ticketsTotal() + this.campingsTotal());

  // El backend exige al menos una entrada: solo camping no se puede pagar
  protected readonly canPay = computed(() => this.order().tickets.length > 0 && this.grandTotal() > 0);

  isLoading = computed(() => this.ticketTypes().length === 0 && this.campingTypes().length === 0);

  protected ticketType(id: unknown): TicketType | undefined {
    return this.ticketTypes().find(t => Number(t.id) === Number(id));
  }

  protected campingType(id: unknown): CampingType | undefined {
    return this.campingTypes().find(c => Number(c.id) === Number(id));
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
    if (this.isPaying() || !this.canPay()) return;
    this.error.set(null);

    const currentOrder = { ...this.order() }; // Clonamos para evitar mutaciones directas

    if (!this.currentUser()) {
      if (!this.guestEmail() || !this.guestEmail().includes('@')) {
        this.error.set(this.translate.instant('checkout.invalidEmail'));
        return;
      }
      currentOrder.guestEmail = this.guestEmail();
    }

    this.isPaying.set(true);
    this.cart.createOrder(currentOrder).subscribe({
      next: (res) => {
        if (res.success && res.data?.url) {
          window.location.href = res.data.url;
        } else {
          this.isPaying.set(false);
          this.error.set(this.translate.instant('checkout.payError'));
        }
      },
      error: (err) => {
        this.isPaying.set(false);
        this.error.set(err.error?.message || this.translate.instant('checkout.payError'));
      }
    });
  }
}
