import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistApi} from '../../../core/services/artist-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Artist} from '../../../core/models/artist';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artists.html'
})
export class ArtistsAdmin implements OnInit {
  private artistApi = inject(ArtistApi);
  private confirmService = inject(ConfirmDialogService);

  artists = signal<Artist[]>([]);
  isLoading = signal<boolean>(false);

  // Señales para el estado de la paginación
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
        // Asignación de datos desde el objeto Page de Spring
        this.artists.set(response.content || []);
        this.totalPages.set(response.page.totalPages || 0);
        this.totalElements.set(response.page.totalElements || 0);
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
    this.searchTerm.set(input.value);
    this.currentPage.set(0); // Reiniciar a la primera página en cada búsqueda
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
