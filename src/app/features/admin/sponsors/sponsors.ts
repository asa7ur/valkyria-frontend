import {Component, inject, OnInit, signal} from '@angular/core';
import {SponsorApi} from '../../../core/services/sponsor-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Sponsor} from '../../../core/models/sponsor';
import {FilterDTO} from '../../../core/models/filter-dto';
import {RouterLink} from '@angular/router';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-sponsors',
  imports: [
    RouterLink,
    CurrencyPipe
  ],
  templateUrl: './sponsors.html',
})
export class SponsorsAdmin implements OnInit {
  private sponsorApi = inject(SponsorApi);
  private confirmService = inject(ConfirmDialogService);

  sponsors = signal<Sponsor[]>([]);
  isLoading = signal<boolean>(false);

  filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  ngOnInit(): void {
    this.loadSponsors();
  }

  loadSponsors(): void {
    this.isLoading.set(true);
    const f = this.filter();

    this.sponsorApi.getSponsors(f.page, f.itemsPerPage, f.search).subscribe({
      next: (response) => {
        this.sponsors.set(response.data || []);
        this.filter.update(current => ({
          ...current,
          totalPages: response.filter?.totalPages || 0,
          totalElements: response.filter?.totalElements || 0
        }));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.sponsors.set([]);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.update(f => ({...f, search: input.value, page: 0}));
    this.loadSponsors();
  }

  goToPage(page: number): void {
    const current = this.filter();
    if (page >= 0 && page < (current.totalPages || 0)) {
      this.filter.update(f => ({...f, page}));
      this.loadSponsors();
    }
  }

  async deleteSponsor(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Patrocinador',
      message: '¿Estás seguro de que deseas eliminar este patrocinador?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.sponsorApi.deleteSponsor(id).subscribe({
        next: () => this.loadSponsors()
      })
    }
  }
}
