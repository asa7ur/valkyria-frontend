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

  // Base URL de tu servidor y carpeta de subidas configurada en WebConfig
  private readonly baseUrl = 'http://localhost:8080/uploads/artists';

  protected displayImage = computed(() => {
    const images = this.artist().images;
    const logo = this.artist().logo;

    // 1. Si hay imágenes, devolvemos la URL completa de la primera
    if (images && images.length > 0) {
      return `${this.baseUrl}/${images[0].imageUrl}`;
    }

    // 2. Si no hay imágenes pero hay logo, devolvemos la URL del logo
    if (logo) {
      return `${this.baseUrl}/${logo}`;
    }

    // 3. Imagen por defecto si no hay nada (opcional)
    return 'assets/images/placeholder-artist.jpg';
  });
}
