import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistCard} from './components/artist-card/artist-card';
import {ArtistApi} from '../../core/services/artist-api';
import {Artist} from '../../core/models/artist';
import {Subject, debounceTime, distinctUntilChanged} from 'rxjs';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule, ArtistCard],
  templateUrl: './artists.html',
})
export class Artists implements OnInit {
  private api = inject(ArtistApi);

  protected isLoading = signal<boolean>(true);
  protected artists = signal<Artist[]>([]);
  protected searchTerm = signal<string>('');

  // Variables de control de paginación
  private currentPage = 0;
  protected hasMore = signal<boolean>(false);
  private readonly pageSize = 9;

  // Para evitar saturar el servidor con cada pulsación de tecla
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadArtists();

    // Configurar búsqueda reactiva con delay (debounce)
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.resetAndLoad();
    });
  }

  /**
   * Carga una página de artistas y la añade o reemplaza según corresponda.
   */
  loadArtists(append: boolean = false) {
    this.isLoading.set(true);
    this.api.getArtists(this.searchTerm(), this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const newData = response.content; // Extraer datos de la página

        if (append) {
          this.artists.update(prev => [...prev, ...newData]);
        } else {
          this.artists.set(newData);
        }

        // Determinar si hay más páginas disponibles
        this.hasMore.set(!response.last);
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
    this.searchSubject.next(input.value);
  }

  loadMore() {
    this.currentPage++;
    this.loadArtists(true);
  }

  private resetAndLoad() {
    this.currentPage = 0;
    this.loadArtists(false);
  }
}
