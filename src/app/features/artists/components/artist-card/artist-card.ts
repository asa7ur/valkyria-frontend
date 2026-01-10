import {Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Artist} from '../../../../core/models/artist';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artist-card.html',
  host: {
    'class': 'block animate-in'
  }
})
export class ArtistCard {
  artist = input.required<Artist>();

  private readonly baseUrl = 'http://localhost:8080/uploads/artists';

  protected displayImage = computed(() => {
    const images = this.artist().images;
    if (images && images.length > 0) {
      // Usamos el formato optimizado thumb
      return `${this.baseUrl}/${images[0].imageUrl}_thumb.webp`;
    }
    return null;
  });
}
