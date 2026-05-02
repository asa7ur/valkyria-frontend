import {Component, OnInit, inject, signal, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PerformanceApi} from '../../../core/services/performance-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Performance} from '../../../core/models/performance';
import {FilterDTO} from '../../../core/models/filter-dto';
import {RouterLink} from '@angular/router';
import {ToastService} from '../../../core/services/toast';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-performances',
  imports: [CommonModule, RouterLink],
  templateUrl: './performances.html'
})
export class PerformancesAdmin implements OnInit {
  private performanceApi = inject(PerformanceApi);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected performances = signal<Performance[]>([]);
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
    // Escuchamos los cambios de búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(searchTerm => {
      this.filter.update(f => ({ ...f, search: searchTerm, page: 0 }));
      this.loadPerformances();
    });
  }

  ngOnInit(): void {
    this.loadPerformances();
  }

  private loadPerformances(): void {
    this.isLoading.set(true);
    const {page, itemsPerPage, search} = this.filter();

    this.performanceApi.getPerformances(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.performances.set(response.data || []);
          this.filter.update(f => ({
            ...f,
            totalPages: response.filter?.totalPages || 0,
            totalElements: response.filter?.totalElements || 0
          }));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando actuaciones:', err);
          this.isLoading.set(false);
          this.performances.set([]);
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
      this.loadPerformances();
    }
  }

  async deletePerformance(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Actuación',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    this.performanceApi.deletePerformance(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Actuación eliminada correctamente', 'success');
          this.loadPerformances();
        },
        error: () => this.toast.show('Error al eliminar', 'error')
      });
  }
}
