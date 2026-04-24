import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TicketTypeApi} from '../../../core/services/ticket-type-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {TicketType} from '../../../core/models/ticket-types';
import {FilterDTO} from '../../../core/models/filter-dto';

@Component({
  selector: 'app-ticket-types-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-types.html'
})
export class TicketTypesAdmin implements OnInit {
  private api = inject(TicketTypeApi);
  private confirmService = inject(ConfirmDialogService);

  ticketTypes = signal<TicketType[]>([]);
  isLoading = signal<boolean>(false);

  filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    const f = this.filter();

    this.api.getTicketTypes(f.page, f.itemsPerPage, f.search).subscribe({
      next: (response) => {
        this.ticketTypes.set(response.data || []);

        this.filter.update(f => ({
          ...f,
          totalPages: response.filter?.totalPages || 0,
          totalElements: response.filter?.totalElements || 0
        }));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando tipos de entradas:', err);
        this.isLoading.set(false);
        this.ticketTypes.set([]);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.update(f => ({...f, search: input.value, page: 0}));
    this.loadData();
  }

  goToPage(page: number): void {
    const f = this.filter();
    if (f.totalPages && page >= 0 && page < f.totalPages) {
      this.filter.update(f => ({...f, page}));
      this.loadData();
    }
  }

  async deleteType(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Tipo de Entrada',
      message: '¿Estás seguro de que deseas eliminar este tipo? Esto afectará a la disponibilidad del ticket.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.api.deleteTicketType(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
