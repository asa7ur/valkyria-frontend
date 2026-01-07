import {Component, signal, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TicketProvider} from '../../../../core/services/ticket-provider';
import {TicketType} from '../../../../core/models/ticket-types';

@Component({
  selector: 'app-tickets-section',
  imports: [RouterLink], // Añadido a los imports del componente
  templateUrl: './tickets-section.html'
})
export class TicketsSection implements OnInit {
  private ticketProvider = inject(TicketProvider);
  protected readonly tickets = signal<TicketType[]>([]);

  ngOnInit() {
    this.ticketProvider.getTicketTypes().subscribe({
      next: (data) => this.tickets.set(data),
      error: (err) => console.error('Error cargando tickets:', err)
    });
  }
}
