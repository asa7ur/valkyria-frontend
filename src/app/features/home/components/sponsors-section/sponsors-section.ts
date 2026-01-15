import {Component, inject, signal, OnInit} from '@angular/core';
import {SponsorApi} from '../../../../core/services/sponsor-api';
import {Sponsor} from '../../../../core/models/sponsor';

@Component({
  selector: 'app-sponsors-section',
  standalone: true,
  imports: [],
  templateUrl: './sponsors-section.html',
})
export class SponsorsSection implements OnInit {
  private sponsorApi = inject(SponsorApi);

  protected readonly sponsors = signal<Sponsor[]>([]);

  ngOnInit(): void {
    this.sponsorApi.getSponsors().subscribe({
      next: (response) => {
        this.sponsors.set(response.content || []);
      },
      error: (err) => console.error('Error cargando sponsors', err)
    });
  }
}
