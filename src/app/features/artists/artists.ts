import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistCard} from './components/artist-card/artist-card';
import {ArtistApi} from '../../core/services/artist-api';
import {Artist} from '../../core/models/artist';
import {ConfirmDialogService} from '../../core/services/confirm-dialog';

@Component({
  selector: 'app-artists',
  imports: [CommonModule, ArtistCard],
  templateUrl: './artists.html',
})
export class Artists implements OnInit {
  private api = inject(ArtistApi);

  // Estado de la carga y datos
  protected isLoading = signal<boolean>(true);
  protected artists = signal<Artist[]>([]);

  // Estado de paginación y búsqueda
  protected searchTerm = signal<string>('');
  protected currentPage = signal<number>(0);
  protected totalPages = signal<number>(0);
  protected totalElements = signal<number>(0);
  private readonly pageSize = 9;

  // Calculamos si hay más páginas disponibles para mostrar el botón
  protected hasMore = computed(() => {
    return this.currentPage() < this.totalPages() - 1;
  });

  ngOnInit() {
    this.loadArtists();
  }

  /**
   * Carga artistas desde el servidor.
   * @param append Si es true, añade los resultados a los actuales. Si es false, los reemplaza.
   */
  loadArtists(append: boolean = false) {
    this.isLoading.set(true);
    this.api.getArtists(this.currentPage(), this.pageSize, this.searchTerm()).subscribe({
      next: (response) => {
        if (append) {
          // Acumulamos los nuevos artistas con los que ya teníamos
          this.artists.update(prev => [...prev, ...response.content]);
        } else {
          // Para una nueva búsqueda o carga inicial, reemplazamos
          this.artists.set(response.content);
        }

        this.totalPages.set(response.page.totalPages);
        this.totalElements.set(response.page.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando artistas:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(0); // Reiniciamos a la primera página
    this.loadArtists(false); // Reemplazamos la lista con los nuevos resultados
  }

  loadMore() {
    if (this.hasMore()) {
      this.currentPage.update(p => p + 1);
      this.loadArtists(true); // Añadimos la siguiente página a la lista actual
    }
  }
}
