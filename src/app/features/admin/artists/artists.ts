import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistApi} from '../../../core/services/artist-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Artist} from '../../../core/models/artist';
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

  // Señales para los contadores
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.isLoading.set(true);
    this.artistApi.getArtists(this.currentPage(), 10, this.searchTerm()).subscribe({
      next: (response) => {
        // El contenido de los artistas
        this.artists.set(response.content);

        // Accedemos a los datos dentro del objeto 'page'
        this.totalPages.set(response.page.totalPages);
        this.totalElements.set(response.page.totalElements);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
        this.artists.set([]);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(0);
    this.loadArtists();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadArtists();
    }
  }

  async deleteArtist(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Artista',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.artistApi.deleteArtist(id).subscribe({
        next: () => this.loadArtists(),
        error: (err) => console.error(err)
      });
    }
  }
}
