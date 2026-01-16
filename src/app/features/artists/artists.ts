import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistCard} from './components/artist-card/artist-card';
import {ArtistApi} from '../../core/services/artist-api';
import {Artist} from '../../core/models/artist';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule, ArtistCard],
  templateUrl: './artists.html',
})
export class Artists implements OnInit {
  private api = inject(ArtistApi);

  protected isLoading = signal<boolean>(true);
  private allArtists = signal<Artist[]>([]);
  protected searchTerm = signal<string>('');
  protected limit = signal<number>(9);

  protected filteredArtists = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const artists = this.allArtists();
    if (!term) return artists;
    return artists.filter(a => a.name.toLowerCase().includes(term));
  });

  protected visibleArtists = computed(() => {
    return this.filteredArtists().slice(0, this.limit());
  });

  protected hasMore = computed(() => {
    return this.limit() < this.filteredArtists().length;
  });

  ngOnInit() {
    this.isLoading.set(true);
    this.api.getAllArtists().subscribe({
      next: (data) => {
        this.allArtists.set(data);
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
    this.limit.set(9);
  }

  loadMore() {
    this.limit.update(prev => prev + 9);
  }
}
