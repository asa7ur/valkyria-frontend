import {Component, inject, input, signal, OnInit} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ArtistService} from '../../../../core/services/artist.service';
import {Artist} from '../../../../core/models/artist.model';
import {LineupService} from '../../../../core/services/lineup.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-detail.html',
})
export class ArtistDetail implements OnInit {
  private artistService = inject(ArtistService);
  private lineupService = inject(LineupService);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);

  protected readonly baseUrl = 'http://localhost:8080/uploads/artists';

  id = input.required<string>();
  protected artist = signal<Artist | null>(null);
  protected loading = signal(true);
  protected currentImageIndex = signal(0);

  ngOnInit() {
    // Cargamos el artista y el lineup completo simultáneamente para cruzar los datos
    forkJoin({
      artist: this.artistService.getArtistById(this.id()),
      allPerformances: this.lineupService.getLineup()
    }).subscribe({
      next: ({artist, allPerformances}) => {
        // Buscamos las actuaciones que corresponden a este artista si no vienen incluidas
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
