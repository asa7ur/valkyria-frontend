import {Component, OnInit, inject, signal, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CampingApi} from '../../../core/services/camping-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Camping} from '../../../core/models/camping';
import {ToastService} from '../../../core/services/toast';
import {FilterDTO} from '../../../core/models/filter-dto';
import {debounceTime, distinctUntilChanged, Subject, switchMap, of} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CampingTypeApi} from '../../../core/services/camping-type-api';
import {TicketProvider} from '../../../core/services/ticket-provider';

@Component({
  selector: 'app-campings-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './campings.html'
})
export class CampingsAdmin implements OnInit {
  private campingApi = inject(CampingApi);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly campingTypeApi = inject(CampingTypeApi);
  private readonly campingProvider = inject(TicketProvider);

  // Signals para el estado de la lista
  protected campings = signal<Camping[]>([]);
  protected isLoading = signal<boolean>(false);
  protected filter = signal<FilterDTO>({
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
      this.loadCampings();
    });
  }

  ngOnInit(): void {
    this.loadCampings();
  }

  private loadCampings(): void {
    this.isLoading.set(true);
    const {page, itemsPerPage, search} = this.filter();

    this.campingApi.getCampings(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.campings.set(response.data || []);
          this.filter.update(f => ({
            ...f,
            totalPages: response.filter?.totalPages || 0,
            totalElements: response.filter?.totalElements || 0,
          }));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando campings:', err);
          this.isLoading.set(false);
          this.campings.set([]);
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
      this.filter.update(prev => ({ ...prev, page }));
      this.loadCampings();
    }
  }

  async deleteCamping(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Camping',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    const campingToDelete = this.campings().find(c => c.id === id);

    this.campingApi.deleteCamping(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.campingProvider.clearCampingTypesCache();
          this.toast.show("Camping eliminado correctamente", "success");
          this.loadCampings();
        },
        error: () => this.toast.show("Error al eliminar", "error")
      });
  }

}
