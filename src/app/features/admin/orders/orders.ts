import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {OrderApi} from '../../../core/services/order-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {OrderDTO} from '../../../core/models/order-schema';
import {FilterDTO} from '../../../core/models/filter-dto';
import {CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ToastService} from '../../../core/services/toast';

@Component({
  selector: 'app-orders',
  imports: [
    DatePipe,
    CurrencyPipe,
    NgClass
  ],
  templateUrl: './orders.html',
})
export class OrdersAdmin implements OnInit {
  private orderApi = inject(OrderApi);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected orders = signal<OrderDTO[]>([]);
  protected isLoading = signal<boolean>(false);
  protected filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(searchTerm => {
      this.filter.update(f => ({...f, search: searchTerm, page: 0}));
      this.loadOrders();
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    const {page, itemsPerPage, search} = this.filter();

    this.orderApi.getOrders(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
   this.searchSubject.next(input.value);
  }

  protected goToPage(page: number): void {
    const f = this.filter();
    if (page >= 0 && page < (f.totalPages || 0)) {
      this.filter.update(prev => ({...prev, page}));
      this.loadOrders();
    }
  }

  async deleteOrder(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Pedido',
      message: '¿Estás seguro?.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    this.orderApi.deleteOrder(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Pedido eliminado correctamente', 'success');
          this.loadOrders();
        },
        error: () => this.toast.show('Error al eliminar', 'error')
      })
  }
}
