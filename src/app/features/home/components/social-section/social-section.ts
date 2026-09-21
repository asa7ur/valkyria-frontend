import {Component, ElementRef, afterNextRender, inject, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

interface SocialShield {
  name: string;
  handle: string;
  icon: string;
  // Motivo pintado en rojo sobre la madera del escudo (ver social-section.css)
  paint: 'quarters' | 'halves' | 'pinwheel' | 'cross';
}

// De momento no hay enlaces reales: los escudos solo muestran la red y el usuario, sin poder clicarse
@Component({
  selector: 'app-social-section',
  templateUrl: './social-section.html',
  styleUrl: './social-section.css',
  imports: [
    TranslatePipe
  ]
})
export class SocialSection {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Los escudos llegan rodando al entrar la sección en pantalla
  protected readonly revealed = signal(false);

  protected readonly shields: SocialShield[] = [
    {name: 'Instagram', handle: '@valkyria', icon: 'fa-brands fa-instagram', paint: 'quarters'},
    {name: 'TikTok', handle: '@valkyria_oficial', icon: 'fa-brands fa-tiktok', paint: 'halves'},
    {name: 'Facebook', handle: 'Valkyria Sevilla', icon: 'fa-brands fa-facebook-f', paint: 'pinwheel'},
    {name: 'YouTube', handle: 'Valkyria TV', icon: 'fa-brands fa-youtube', paint: 'cross'},
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
