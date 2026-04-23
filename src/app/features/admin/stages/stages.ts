import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StageApi} from '../../../core/services/stage-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Stage} from '../../../core/models/stage';
import {RouterLink} from '@angular/router';
import {FilterDTO} from '../../../core/models/filter-dto';

@Component({
  selector: 'app-stages',
  imports: [CommonModule, RouterLink],
  templateUrl: './stages.html'
})
export class StagesAdmin implements OnInit {
  private stageApi = inject(StageApi);
  private confirmService = inject(ConfirmDialogService);

  stages = signal<Stage[]>([]);
  isLoading = signal<boolean>(false);

  filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  ngOnInit(): void {
    this.loadStages();
  }

  loadStages(): void {
    this.isLoading.set(true);
    const f = this.filter();

    this.stageApi.getStages(f.page, f.itemsPerPage, f.search).subscribe({
      next: (response) => {
        this.stages.set(response.data || []);

        this.filter.update(f => ({
          ...f,
          totalPages: response.filter?.totalPages || 0,
          totalElements: response.filter?.totalElements || 0
        }));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando escenarios:', err);
        this.isLoading.set(false);
        this.stages.set([]);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.update(f => ({...f, search: input.value, page: 0}));
    this.loadStages();
  }

  goToPage(page: number): void {
    const f = this.filter();
    if (f.totalPages && page >= 0 && page < f.totalPages) {
      this.filter.update(f => ({...f, page}));
      this.loadStages();
    }
  }

  async deleteStage(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Escenario',
      message: '¿Estás seguro de que deseas eliminar este escenario? Esta acción no se puede deshacer.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.stageApi.deleteStage(id).subscribe({
        next: () => this.loadStages(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
