import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CampingTypeApi} from '../../../core/services/camping-type-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {CampingType} from '../../../core/models/ticket-types';

@Component({
  selector: 'app-camping-types-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './camping-types.html'
})
export class CampingTypesAdmin implements OnInit {
  private api = inject(CampingTypeApi);
  private confirmService = inject(ConfirmDialogService);

  campingTypes = signal<CampingType[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getAllCampingTypes().subscribe({
      next: (response) => {
        const content = response.data || [];
        this.campingTypes.set(content);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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
