import {Component, signal, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Artist} from '../../../../core/models/festival.models';

@Component({
  selector: 'app-lineup-section',
  imports: [],
  templateUrl: './lineup-section.html',
  styles: ``,
})
export class LineupSection implements OnInit {
  private http = inject(HttpClient);
  protected readonly artists = signal<Artist[]>([]);

  ngOnInit() {
    this.http.get<Artist[]>('http://localhost:8080/api/artists')
      .subscribe({
        next: (data) => this.artists.set(data),
        error: (err) => console.error('Error:', err)
      });
  }
}
