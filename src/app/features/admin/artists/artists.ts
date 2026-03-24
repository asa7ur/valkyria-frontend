import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistApi} from '../../../core/services/artist-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Artist} from '../../../core/models/artist';
import {FilterDTO} from '../../../core/models/filter-dto';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-artists',
  imports: [CommonModule, RouterLink],
  templateUrl: './artists.html'
})
export class ArtistsAdmin implements OnInit {
  private artistApi = inject(ArtistApi);
  private confirmService = inject(ConfirmDialogService);

  artists = signal<Artist[]>([]);
  isLoading = signal<boolean>(false);

  filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.isLoading.set(true);
    const currentFilter = this.filter();

    this.artistApi.getArtists(currentFilter.page, currentFilter.itemsPerPage, currentFilter.search).subscribe({
      next: (response) => {
        this.artists.set(response.data || []);

        this.filter.update(f => ({
          ...f,
          totalPages: response.filter?.totalPages || 0,
          totalElements: response.filter?.totalElements || 0
        }));

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando artistas:', err);
        this.isLoading.set(false);
        this.artists.set([]);
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

    this.loadArtists();
  }

  goToPage(page: number): void {
    const currentFilter = this.filter();

    if (currentFilter.totalPages && page >= 0 && page < currentFilter.totalPages) {
      this.filter.update(f => ({...f, page}));
      this.loadArtists();
    }
  }

  async deleteArtist(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Artista',
      message: '¿Estás seguro de que deseas eliminar este artista? Esta acción no se puede deshacer.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.artistApi.deleteArtist(id).subscribe({
        next: () => this.loadArtists(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
