import {Component, OnInit, inject, signal, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CampingTypeApi} from '../../../core/services/camping-type-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {CampingType} from '../../../core/models/ticket-types';
import {FilterDTO} from '../../../core/models/filter-dto';
import {ToastService} from '../../../core/services/toast';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-camping-types-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './camping-types.html'
})
export class CampingTypesAdmin implements OnInit {
  private api = inject(CampingTypeApi);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  campingTypes = signal<CampingType[]>([]);
  isLoading = signal<boolean>(false);
  filter = signal<FilterDTO>({
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
      this.loadCampingTypes();
    });
  }

  ngOnInit(): void {
    this.loadCampingTypes();
  }

  loadCampingTypes(): void {
    this.isLoading.set(true);
    const { page, itemsPerPage, search } = this.filter();

    this.api.getCampingTypes(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Seguridad ante destrucción
      .subscribe({
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
    this.searchSubject.next(input.value); // Enviamos al Subject con debounce
  }

  goToPage(page: number): void {
    const f = this.filter();
    if (page >= 0 && page < (f.totalPages || 0)) {
      this.filter.update(prev => ({...prev, page}));
      this.loadCampingTypes();
    }
  }

  async deleteType(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Tipo de Camping',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    this.api.deleteCampingType(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Tipo de camping eliminado correctamente', 'success');
          this.loadCampingTypes();
        },
        error: () => this.toast.show('Error al eliminar', 'error')
      });
  }
}
