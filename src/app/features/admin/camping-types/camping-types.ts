import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CampingTypeApi} from '../../../core/services/camping-type-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {CampingType} from '../../../core/models/ticket-types';
import {FilterDTO} from '../../../core/models/filter-dto';

@Component({
  selector: 'app-camping-types-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './camping-types.html'
})
export class CampingTypesAdmin implements OnInit {
  private api = inject(CampingTypeApi);
  private confirmService = inject(ConfirmDialogService);

  campingTypes = signal<CampingType[]>([]);
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

    this.api.getCampingTypes(f.page, f.itemsPerPage, f.search).subscribe({
      next: (response) => {
        this.campingTypes.set(response.data || []);

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
        this.campingTypes.set([]);
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
      title: 'Eliminar Tipo de Camping',
      message: '¿Estás seguro de que deseas eliminar este tipo? Esto afectará a la disponibilidad del camping.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.api.deleteCampingType(id).subscribe(() => this.loadData());
    }
  }
}
