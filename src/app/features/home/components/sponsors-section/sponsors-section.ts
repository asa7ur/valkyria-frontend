import {Component, ElementRef, afterNextRender, inject, signal, OnInit} from '@angular/core';
import {SponsorApi} from '../../../../core/services/sponsor-api';
import {Sponsor} from '../../../../core/models/sponsor';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-sponsors-section',
  imports: [
    TranslatePipe
  ],
  templateUrl: './sponsors-section.html',
  styleUrl: './sponsors-section.css',
})
export class SponsorsSection implements OnInit {
  private sponsorApi = inject(SponsorApi);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly sponsors = signal<Sponsor[]>([]);
  public readonly imagesBaseUrl = this.sponsorApi.imagesBaseUrl;

  // Los logos aparecen al entrar la sección en pantalla
  protected readonly revealed = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) {
        this.revealed.set(true);
        return;
      }
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.revealed.set(true);
          observer.disconnect();
        }
      }, {threshold: 0.2});
      observer.observe(this.host.nativeElement);
    });
  }

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
