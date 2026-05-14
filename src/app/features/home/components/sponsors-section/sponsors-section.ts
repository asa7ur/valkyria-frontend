import {Component, inject, signal, OnInit} from '@angular/core';
import {SponsorApi} from '../../../../core/services/sponsor-api';
import {Sponsor} from '../../../../core/models/sponsor';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-sponsors-section',
  imports: [
    TranslatePipe
  ],
  templateUrl: './sponsors-section.html',
})
export class SponsorsSection implements OnInit {
  private sponsorApi = inject(SponsorApi);

  protected readonly sponsors = signal<Sponsor[]>([]);
  public readonly imagesBaseUrl = this.sponsorApi.imagesBaseUrl;

  ngOnInit(): void {
    this.sponsorApi.getAllSponsors().subscribe({
      next: (response) => {
        const processedSponsors = (response.data || []).map(sponsor => ({
          ...sponsor,
          image: sponsor.image ? `${this.imagesBaseUrl}/${sponsor.image}_full.webp` : undefined
        }));
        this.sponsors.set(processedSponsors);
      },
      error: (err) => console.error('Error cargando patrocinadores', err)
    });
  }
}
