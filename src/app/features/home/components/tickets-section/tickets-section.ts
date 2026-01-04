import {Component, signal, inject, OnInit} from '@angular/core';
import {TicketService} from '../../../../core/services/ticket.service';
import {TicketType} from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-tickets-section',
  templateUrl: './tickets-section.html'
})
export class TicketsSection implements OnInit {
  private ticketService = inject(TicketService);
  protected readonly tickets = signal<TicketType[]>([]);

  ngOnInit() {
    this.ticketService.getTicketTypes().subscribe({
      next: (data) => this.tickets.set(data),
      error: (err) => console.error('Error cargando tickets:', err)
    });
  }
}
