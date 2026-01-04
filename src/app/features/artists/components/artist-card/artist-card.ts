import {Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Artist} from '../../../../core/models/artist.model';

@Component({
  selector: 'app-artist-card',
  imports: [CommonModule],
  templateUrl: './artist-card.html',
  styles: ``,
})
export class ArtistCard {
  artist = input.required<Artist>();

  private readonly baseUrl = 'http://localhost:8080/uploads/artists';

  protected displayImage = computed(() => {
    const images = this.artist().images;

    if (images && images.length > 0) {
      // Retornamos la primera con el formato optimizado
      return `${this.baseUrl}/${images[0].imageUrl}_thumb.webp`;
    }

    // Si no hay imágenes, devolvemos null para controlar el icono en el HTML
    return null;
  });
}
