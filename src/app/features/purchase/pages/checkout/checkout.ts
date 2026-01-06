import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {OrderService} from '../../../../core/services/order.service';
import {TicketService} from '../../../../core/services/ticket.service';
import {TicketType, CampingType} from '../../../../core/models/ticket.model';
import {OrderRequest} from '../../../../core/models/order.model';
import {forkJoin} from 'rxjs'; // Importante para sincronizar

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
  isLoading = true; // Nueva variable para controlar el estado global

  ngOnInit() {
    this.order = this.orderService.getOrder();

    if (!this.order || (this.order.tickets.length === 0 && this.order.campings.length === 0)) {
      this.router.navigate(['/purchase']);
      return;
    }

    // Cargamos AMBOS tipos (Tickets y Campings) a la vez
    forkJoin({
      tickets: this.ticketService.getTicketTypes(),
      campings: this.ticketService.getCampingTypes()
    }).subscribe({
      next: (res) => {
        this.ticketTypes = res.tickets;
        this.campingTypes = res.campings;
        this.calculateTotal();
        this.isLoading = false; // Ya tenemos todo, quitamos el cargando
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

  getTicketName(id: any): string { // Cambiamos a 'any' para evitar errores de compilación al recibir el string del form
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

      this.orderService.setOrder(this.order);
      this.calculateTotal();
    }
  }

  confirmAndPay() {
    if (this.order) {
      this.orderService.createOrder(this.order).subscribe({
        next: (res) => window.location.href = res.url,
        error: (err) => alert(err.error?.message || 'Error al procesar el pago')
      });
    }
  }
}
