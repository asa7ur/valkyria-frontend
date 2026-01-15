import {Component, signal, inject, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Artist} from '../../../../core/models/artist';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-lineup-section',
  standalone: true, // Asegúrate de que sea standalone si lo usas así
  imports: [RouterLink],
  templateUrl: './lineup-section.html',
  styles: ``,
})
export class LineupSection implements OnInit {
  private http = inject(HttpClient);
  protected readonly artists = signal<Artist[]>([]);
  private readonly baseUrl = 'http://localhost:8080/uploads/artists/';

  ngOnInit() {
    const params = new HttpParams().set('size', '100');

    this.http.get<any>('http://localhost:8080/api/v1/artists', {params})
      .subscribe({
        next: (response) => {
          const data = response.content || [];

          const randomArtists = data
            .filter((artist: Artist) => !!artist.logo) // Solo artistas con logo
            .map((artist: Artist) => ({
              ...artist,
              logo: `${this.baseUrl}${artist.logo}_thumb.webp`
            }))
            .sort(() => Math.random() - 0.5) // Mezclamos
            .slice(0, 24);

          this.artists.set(randomArtists);
        },
        error: (err) => console.error('Error cargando lineup:', err)
      });
  }
}
