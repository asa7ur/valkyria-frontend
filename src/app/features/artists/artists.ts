import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistCard} from './components/artist-card/artist-card';
import {ArtistService} from '../../core/services/artist.service';
import {Artist} from '../../core/models/artist.model';

@Component({
  selector: 'app-artists',
  imports: [CommonModule, ArtistCard],
  templateUrl: './artists.html',
})
export class Artists implements OnInit {
  private artistService = inject(ArtistService);

  // Signals para el estado
  private allArtists = signal<Artist[]>([]);
  protected searchTerm = signal<string>('');
  protected limit = signal<number>(9);

  protected filteredArtists = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const artists = this.allArtists();

    if (!term) return artists;

    return artists.filter(a =>
      a.name.toLowerCase().includes(term)
    );
  });

  // Obtener solo los artistas que debemos mostrar (paginación "Load More")
  protected visibleArtists = computed(() => {
    return this.filteredArtists().slice(0, this.limit());
  });

  // Comprobar si quedan más artistas por cargar
  protected hasMore = computed(() => {
    return this.limit() < this.filteredArtists().length;
  });

  ngOnInit() {
    this.artistService.getArtists().subscribe({
      next: (data) => this.allArtists.set(data),
      error: (err) => console.error('Error cargando artistas:', err)
    });
  }

  // Métodos de acción
  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.limit.set(9);
  }

  loadMore() {
    this.limit.update(prev => prev + 9);
  }
}
