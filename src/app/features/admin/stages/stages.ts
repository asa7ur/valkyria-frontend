import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StageApi} from '../../../core/services/stage-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Stage} from '../../../core/models/stage';
import {RouterLink} from '@angular/router';

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

  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadStages();
  }

  loadStages(): void {
    this.isLoading.set(true);
    this.stageApi.getStages(this.currentPage(), 10, this.searchTerm()).subscribe({
      next: (response) => {
        this.stages.set(response.content || []);
        this.totalPages.set(response.page.totalPages || 0);
        this.totalElements.set(response.page.totalElements || 0);
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
    this.searchTerm.set(input.value);
    this.currentPage.set(0);
    this.loadStages();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
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
