import {Component, signal, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Artist} from '../../../../core/models/artist';
import {RouterLink} from '@angular/router';
import {ResponseDTO} from '../../../../core/models/response-dto';

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
    this.http.get<ResponseDTO<Artist[]>>('http://localhost:8080/api/v1/artists/logo')
      .subscribe({
        next: (response) => {
          const content = response.data;

          const randomArtists = content
            .map(artist => ({
              ...artist,
              logo: `${this.baseUrl}${artist.logo}_thumb.webp`
            }))
            .sort(() => Math.random() - 0.5)
            .slice(0, 24);

          this.artists.set(randomArtists);
        },
        error: (err) => console.error(' Error:', err)
      });
  }
}
