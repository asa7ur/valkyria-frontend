import {Component, inject, input, signal, OnInit} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {forkJoin} from 'rxjs';

import {ArtistApi} from '../../../../core/services/artist-api';
import {LineupClient} from '../../../../core/services/lineup-client';
import {Artist} from '../../../../core/models/artist';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-detail.html',
})
export class ArtistDetail implements OnInit {
  private api = inject(ArtistApi);
  private lineup = inject(LineupClient);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);

  protected readonly baseUrl = 'http://localhost:8080/uploads/artists';

  id = input.required<string>();
  protected artist = signal<Artist | null>(null);
  protected loading = signal(true);
  protected currentImageIndex = signal(0);

  ngOnInit() {
    // La lógica permanece igual, aprovechando la reactividad de Angular
    forkJoin({
      artist: this.api.getArtistById(this.id()),
      allPerformances: this.lineup.getLineup()
    }).subscribe({
      next: ({artist, allPerformances}) => {
        // Vinculamos las actuaciones (performances) al objeto artista
        if (!artist.performances || artist.performances.length === 0) {
          artist.performances = allPerformances.filter(p => p.artist.id === artist.id);
        }
        this.artist.set(artist);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading artist detail:', err);
        this.loading.set(false);
      }
    });
  }

  nextImage() {
    const total = this.artist()?.images.length || 0;
    if (total > 1) {
      this.currentImageIndex.update(i => (i + 1) % total);
    }
  }

  prevImage() {
    const total = this.artist()?.images.length || 0;
    if (total > 1) {
      this.currentImageIndex.update(i => (i - 1 + total) % total);
    }
  }

  getSafeSpotifyUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goBack() {
    this.location.back();
  }
}
