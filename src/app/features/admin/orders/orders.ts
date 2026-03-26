import {Component, inject, OnInit, signal} from '@angular/core';
import {OrderApi} from '../../../core/services/order-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {OrderDTO} from '../../../core/models/order-schema';
import {FilterDTO} from '../../../core/models/filter-dto';
import {CurrencyPipe, DatePipe, NgClass} from '@angular/common';

@Component({
  selector: 'app-orders',
  imports: [
    DatePipe,
    CurrencyPipe,
    NgClass
  ],
  templateUrl: './orders.html',
  styles: ``,
})
export class OrdersAdmin implements OnInit {
  private orderApi = inject(OrderApi);
  private confirmService = inject(ConfirmDialogService);

  orders = signal<OrderDTO[]>([]);
  isLoading = signal<boolean>(false);

  filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    const currentFilter = this.filter();

    this.orderApi.getOrders(currentFilter.page, currentFilter.itemsPerPage, currentFilter.search).subscribe({
      next: (response) => {
        this.orders.set(response.data || []);
        this.filter.update(f => ({
          ...f,
          totalPages: response.filter?.totalPages || 0,
          totalElements: response.filter?.totalElements || 0
        }));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando pedidos:', err);
        this.isLoading.set(false);
        this.orders.set([]);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.update(f => ({
      ...f,
      search: input.value,
      page: 0
    }));
    this.loadOrders();
  }

  goToPage(page: number): void {
    const currentFilter = this.filter();

    if (currentFilter.totalPages && page >= 0 && page < currentFilter.totalPages) {
      this.filter.update(f => ({...f, page}));
      this.loadOrders();
    }
  }

  async deleteOrder(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Pedido',
      message: '¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.orderApi.deleteOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => console.error('Error al eliminar el pedido: ', err)
      })
    }
  }
}
