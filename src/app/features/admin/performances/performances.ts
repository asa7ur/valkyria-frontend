import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PerformanceApi} from '../../../core/services/performance-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Performance} from '../../../core/models/performance';
import {FilterDTO} from '../../../core/models/filter-dto';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-performances',
  imports: [CommonModule, RouterLink],
  templateUrl: './performances.html'
})
export class PerformancesAdmin implements OnInit {
  private performanceApi = inject(PerformanceApi);
  private confirmService = inject(ConfirmDialogService);

  performances = signal<Performance[]>([]);
  isLoading = signal<boolean>(false);

  filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  ngOnInit(): void {
    this.loadPerformances();
  }

  loadPerformances(): void {
    this.isLoading.set(true);
    const currentFilter = this.filter();

    this.performanceApi.getPerformances(currentFilter.page, currentFilter.itemsPerPage, currentFilter.search).subscribe({
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
        console.error('Error cargando performanceas:', err);
        this.isLoading.set(false);
        this.performances.set([]);
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

    this.loadPerformances();
  }

  goToPage(page: number): void {
    const currentFilter = this.filter();

    if (currentFilter.totalPages && page >= 0 && page < currentFilter.totalPages) {
      this.filter.update(f => ({...f, page}));
      this.loadPerformances();
    }
  }

  async deletePerformance(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Performancea',
      message: '¿Estás seguro de que deseas eliminar este performancea? Esta acción no se puede deshacer.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.performanceApi.deletePerformance(id).subscribe({
        next: () => this.loadPerformances(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
