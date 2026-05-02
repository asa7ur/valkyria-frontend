import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketApi } from '../../../core/services/ticket-api';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { Ticket } from '../../../core/models/ticket';
import { FilterDTO } from '../../../core/models/filter-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { TicketTypeApi } from '../../../core/services/ticket-type-api';
import { TicketProvider } from '../../../core/services/ticket-provider';

@Component({
  selector: 'app-tickets-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './tickets.html'
})
export class TicketsAdmin implements OnInit {
  private ticketApi = inject(TicketApi);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ticketTypeApi = inject(TicketTypeApi);
  private readonly ticketProvider = inject(TicketProvider);

  // Signals de estado
  protected tickets = signal<Ticket[]>([]);
  protected isLoading = signal<boolean>(false);
  protected filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  // Para el debounce de búsqueda
  private searchSubject = new Subject<string>();

  constructor() {
    // Escuchamos los cambios de búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(searchTerm => {
      this.filter.update(f => ({ ...f, search: searchTerm, page: 0 }));
      this.loadTickets();
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.isLoading.set(true);
    const { page, itemsPerPage, search } = this.filter();

    this.ticketApi.getTickets(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Seguridad ante destrucción
      .subscribe({
        next: (response) => {
          this.tickets.set(response.data || []);
          this.filter.update(f => ({
            ...f,
            totalPages: response.filter?.totalPages || 0,
            totalElements: response.filter?.totalElements || 0
          }));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando tickets:', err);
          this.isLoading.set(false);
          this.tickets.set([]);
        }
      });
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value); // Enviamos al Subject con debounce
  }

  protected goToPage(page: number): void {
    const f = this.filter();
    if (page >= 0 && page < (f.totalPages || 0)) {
      this.filter.update(prev => ({ ...prev, page }));
      this.loadTickets();
    }
  }

  async deleteTicket(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Ticket',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    const ticketToDelete = this.tickets().find(t => t.id === id);

    this.ticketApi.deleteTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ticketProvider.clearTicketTypesCache();
          this.toast.show('Ticket eliminado correctamente', 'success');
          this.loadTickets();
        },
        error: () => this.toast.show('Error al eliminar', 'error')
      });
  }
}
