import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CampingApi} from '../../../core/services/camping-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Camping} from '../../../core/models/camping';

@Component({
  selector: 'app-campings-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './campings.html'
})
export class CampingsAdmin implements OnInit {
  private campingApi = inject(CampingApi);
  private confirmService = inject(ConfirmDialogService);

  // Signals para el estado de la lista
  campings = signal<Camping[]>([]);
  isLoading = signal<boolean>(false);

  // Signals para paginación y búsqueda
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadCampings();
  }

  /**
   * Carga los campings desde el backend aplicando paginación y filtros
   */
  loadCampings(): void {
    this.isLoading.set(true);
    this.campingApi.getCampings(this.currentPage(), 10, this.searchTerm()).subscribe({
      next: (response) => {
        this.campings.set(response.content || []);
        this.totalPages.set(response.page.totalPages || 0);
        this.totalElements.set(response.page.totalElements || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando campings:', err);
        this.isLoading.set(false);
        this.campings.set([]);
      }
    });
  }

  /**
   * Gestiona el evento de búsqueda
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(0); // Reiniciamos a la primera página al buscar
    this.loadCampings();
  }

  /**
   * Navega entre páginas
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadCampings();
    }
  }

  /**
   * Lógica para eliminar un camping con confirmación previa
   */
  async deleteCamping(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Camping',
      message: '¿Estás seguro de que deseas eliminar este camping? Esta acción no se puede deshacer y podría afectar a los registros de ventas.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.campingApi.deleteCamping(id).subscribe({
        next: () => {
          // Si estamos en la última página y borramos el último elemento, volvemos una página atrás
          if (this.campings().length === 1 && this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
          }
          this.loadCampings();
        },
        error: (err) => console.error('Error al eliminar el camping:', err)
      });
    }
  }
}
