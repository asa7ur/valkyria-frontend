import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketTypeApi } from '../../../core/services/ticket-type-api';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { TicketType } from '../../../core/models/ticket-types';
import { FilterDTO } from '../../../core/models/filter-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-ticket-types-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-types.html'
})
export class TicketTypesAdmin implements OnInit {
  private api = inject(TicketTypeApi);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals de estado
  protected ticketTypes = signal<TicketType[]>([]);
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
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    const { page, itemsPerPage, search } = this.filter();

    this.api.getTicketTypes(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Seguridad ante destrucción
      .subscribe({
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

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value); // Enviamos al Subject con debounce
  }

  protected goToPage(page: number): void {
    const f = this.filter();
    if (page >= 0 && page < (f.totalPages || 0)) {
      this.filter.update(prev => ({ ...prev, page }));
      this.loadData();
    }
  }

  async deleteType(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Tipo de Entrada',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    this.api.deleteTicketType(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Tipo de entrada eliminado correctamente', 'success');
          this.loadData();
        },
        error: () => this.toast.show('Error al eliminar', 'error')
      });
  }
}
