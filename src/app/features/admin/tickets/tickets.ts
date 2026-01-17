import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TicketApi} from '../../../core/services/ticket-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Ticket} from '../../../core/models/ticket';

@Component({
  selector: 'app-tickets-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './tickets.html'
})
export class TicketsAdmin implements OnInit {
  private ticketApi = inject(TicketApi);
  private confirmService = inject(ConfirmDialogService);

  // Signals para el estado de la lista
  tickets = signal<Ticket[]>([]);
  isLoading = signal<boolean>(false);

  // Signals para paginación y búsqueda
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadTickets();
  }

  /**
   * Carga los tickets desde el backend aplicando paginación y filtros
   */
  loadTickets(): void {
    this.isLoading.set(true);
    this.ticketApi.getTickets(this.currentPage(), 10, this.searchTerm()).subscribe({
      next: (response) => {
        this.tickets.set(response.content || []);
        this.totalPages.set(response.page.totalPages || 0);
        this.totalElements.set(response.page.totalElements || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando tickets:', err);
        this.isLoading.set(false);
        this.tickets.set([]);
      }
    });
  }

  /**
   * Gestiona el evento de búsqueda
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(0); // Reiniciamos a la primera página al buscar
    this.loadTickets();
  }

  /**
   * Navega entre páginas
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadTickets();
    }
  }

  /**
   * Lógica para eliminar un ticket con confirmación previa
   */
  async deleteTicket(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Ticket',
      message: '¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer y podría afectar a los registros de ventas.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.ticketApi.deleteTicket(id).subscribe({
        next: () => {
          // Si estamos en la última página y borramos el último elemento, volvemos una página atrás
          if (this.tickets().length === 1 && this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
          }
          this.loadTickets();
        },
        error: (err) => console.error('Error al eliminar el ticket:', err)
      });
    }
  }
}
