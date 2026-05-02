import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {SponsorApi} from '../../../core/services/sponsor-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Sponsor} from '../../../core/models/sponsor';
import {FilterDTO} from '../../../core/models/filter-dto';
import {RouterLink} from '@angular/router';
import {CurrencyPipe} from '@angular/common';
import {ToastService} from '../../../core/services/toast';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sponsors',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './sponsors.html',
})
export class SponsorsAdmin implements OnInit {
  private sponsorApi = inject(SponsorApi);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected sponsors = signal<Sponsor[]>([]);
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
      this.loadSponsors();
    });
  }

  ngOnInit(): void {
    this.loadSponsors();
  }

  private loadSponsors(): void {
    this.isLoading.set(true);
    const { page, itemsPerPage, search } = this.filter();

    this.sponsorApi.getSponsors(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.sponsors.set(response.data || []);
          this.filter.update(current => ({
            ...current,
            totalPages: response.filter?.totalPages || 0,
            totalElements: response.filter?.totalElements || 0
          }));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando patrocinadores:', err);
          this.isLoading.set(false);
          this.sponsors.set([]);
        }
      });
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  protected goToPage(page: number): void {
    const f = this.filter();
    if (page >= 0 && page < (f.totalPages|| 0)) {
      this.filter.update(prev => ({...prev, page}));
      this.loadSponsors();
    }
  }

  async deleteSponsor(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Patrocinador',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    this.sponsorApi.deleteSponsor(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Patrocindaor eliminado correctamente', 'success');
          this.loadSponsors();
        },
        error: () => this.toast.show('Error al eliminar', 'error')
      });
  }
}
