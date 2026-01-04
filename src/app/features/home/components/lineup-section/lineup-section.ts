import {Component, signal, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Artist} from '../../../../core/models/artist.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-lineup-section',
  imports: [
    RouterLink
  ],
  templateUrl: './lineup-section.html',
  styles: ``,
})
export class LineupSection implements OnInit {
  private http = inject(HttpClient);
  protected readonly artists = signal<Artist[]>([]);

  ngOnInit() {
    this.http.get<Artist[]>('http://localhost:8080/api/artists')
      .subscribe({
        next: (data) => {
          const randomArtists = data
            .sort(() => Math.random() - 0.5)
            .slice(0, 18);
          this.artists.set(randomArtists);
        },
        error: (err) => console.error('Error:', err)
      });
  }
}
