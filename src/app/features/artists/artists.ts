import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistCard } from './components/artist-card/artist-card';
import { ArtistApi } from '../../core/services/artist-api';
import { Artist } from '../../core/models/artist';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule, ArtistCard, TranslatePipe],
  templateUrl: './artists.html',
})
export class Artists implements OnInit {
  private api = inject(ArtistApi);

  // Signals de estado
  protected isLoading = signal<boolean>(true);
  protected artists = signal<Artist[]>([]);
  protected searchTerm = signal<string>('');

  // Paginación
  protected currentPage = signal<number>(0);
  protected totalPages = signal<number>(0);
  protected totalElements = signal<number>(0);
  private readonly pageSize = 9;

  protected hasMore = computed(() => this.currentPage() < this.totalPages() - 1);

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists(append: boolean = false) {
    this.isLoading.set(true);

    this.api.getArtists(this.currentPage(), this.pageSize, this.searchTerm()).subscribe({
      next: (response) => {
        const content = response.data || [];
        this.artists.update(prev => append ? [...prev, ...content] : content);

        this.totalPages.set(response.filter.totalPages);
        this.totalElements.set(response.filter.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(0);
    this.loadArtists(false);
  }

  loadMore() {
    if (this.hasMore() && !this.isLoading()) {
      this.currentPage.update(p => p + 1);
      this.loadArtists(true);
    }
  }
}
