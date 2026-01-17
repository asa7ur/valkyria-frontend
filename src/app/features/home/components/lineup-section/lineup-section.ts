import {Component, signal, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Artist} from '../../../../core/models/artist';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-lineup-section',
  imports: [RouterLink],
  templateUrl: './lineup-section.html',
  styles: ``,
})
export class LineupSection implements OnInit {
  private http = inject(HttpClient);
  protected readonly artists = signal<Artist[]>([]);
  private readonly baseUrl = 'http://localhost:8080/uploads/artists/';

  ngOnInit() {
    this.http.get<Artist[]>('http://localhost:8080/api/v1/artists/logo')
      .subscribe({
        next: (content) => {
          const randomArtists = content
            .map(artist => ({
              ...artist,
              logo: `${this.baseUrl}${artist.logo}_thumb.webp`
            }))
            .sort(() => Math.random() - 0.5)
            .slice(0, 24);

          this.artists.set(randomArtists);
        },
        error: (err) => console.error('Error:', err)
      });
  }
}
