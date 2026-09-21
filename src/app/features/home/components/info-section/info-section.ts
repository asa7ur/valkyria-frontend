import {Component, ElementRef, afterNextRender, inject, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

interface InfoBanner {
  numeral: string;
  value: string;
  label: string;
  image: string;
  // Giro y desplazamiento de cada estandarte: en móvil (rejilla 2x2) y en escritorio (abanico)
  rotate: number;
  offsetY: number;
  rotateMd: number;
  offsetYMd: number;
}

@Component({
  selector: 'app-info-section',
  templateUrl: './info-section.html',
  styleUrl: './info-section.css',
  imports: [
    TranslatePipe
  ]
})
export class InfoSection {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Los estandartes caen al entrar la sección en pantalla
  protected readonly revealed = signal(false);

  protected readonly banners: InfoBanner[] = [
    {
      numeral: 'I', value: 'home.info.location_value', label: 'home.info.location_label', image: 'info/location.webp',
      rotate: -4, offsetY: 0, rotateMd: -9, offsetYMd: 56
    },
    {
      numeral: 'II', value: 'home.info.duration_value', label: 'home.info.duration_label', image: 'info/days.webp',
      rotate: 3, offsetY: 16, rotateMd: -3, offsetYMd: 8
    },
    {
      numeral: 'III', value: 'home.info.artists_count', label: 'home.info.artists_label', image: 'info/artists.webp',
      rotate: -3, offsetY: 0, rotateMd: 3, offsetYMd: 8
    },
    {
      numeral: 'IV', value: 'home.info.stages_value', label: 'home.info.stages_label', image: 'info/stages.webp',
      rotate: 4, offsetY: 16, rotateMd: 9, offsetYMd: 56
    },
  ];

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
      }, {threshold: 0.25});
      observer.observe(this.host.nativeElement);
    });
  }
}
