import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

// Componentes locales
import {ArtistCard} from './components/artist-card/artist-card';

// Núcleo: Importaciones con nombres descriptivos sin sufijos
import {ArtistApi} from '../../core/services/artist-api';
import {Artist} from '../../core/models/artist';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule, ArtistCard],
  templateUrl: './artists.html',
})
export class Artists implements OnInit {
  // Inyección de la API con un nombre de variable directo y semántico
  private api = inject(ArtistApi);

  // Signals para gestionar el estado reactivo de la vista
  private allArtists = signal<Artist[]>([]);
  protected searchTerm = signal<string>('');
  protected limit = signal<number>(9);

  /**
   * Lógica computada para filtrar los artistas según el término de búsqueda.
   */
  protected filteredArtists = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const artists = this.allArtists();

    if (!term) return artists;

    return artists.filter(a =>
      a.name.toLowerCase().includes(term)
    );
  });

  /**
   * Obtiene solo los artistas que se deben mostrar actualmente (paginación "Load More").
   */
  protected visibleArtists = computed(() => {
    return this.filteredArtists().slice(0, this.limit());
  });

  /**
   * Comprueba si quedan más artistas disponibles para cargar en la lista filtrada.
   */
  protected hasMore = computed(() => {
    return this.limit() < this.filteredArtists().length;
  });

  ngOnInit() {
    // Uso de la 'api' para obtener la lista completa de artistas
    this.api.getArtists().subscribe({
      next: (data) => this.allArtists.set(data),
      error: (err) => console.error('Error cargando artistas:', err)
    });
  }

  /**
   * Actualiza el término de búsqueda y resetea el límite de visualización.
   */
  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.limit.set(9);
  }

  /**
   * Incrementa el límite para mostrar más artistas en la interfaz.
   */
  loadMore() {
    this.limit.update(prev => prev + 9);
  }
}
