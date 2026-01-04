import {Component, inject, input, signal, OnInit} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ArtistService} from '../../../../core/services/artist.service';
import {Artist} from '../../../../core/models/artist.model';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-detail.html',
})
export class ArtistDetail implements OnInit {
  private artistService = inject(ArtistService);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);

  id = input.required<string>();
  protected artist = signal<Artist | null>(null);
  protected loading = signal(true);

  ngOnInit() {
    this.artistService.getArtistById(this.id()).subscribe({
      next: (data) => {
        this.artist.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getSafeSpotifyUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goBack() {
    this.location.back();
  }
}
