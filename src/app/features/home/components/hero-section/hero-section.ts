import {Component, ElementRef, afterNextRender, signal, viewChild} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

// Fracción de la altura de la ventana que hay que bajar para que el hero desaparezca del todo
const FADE_DISTANCE = 0.9;

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './hero-section.html',
  styles: ``,
  host: {
    '[style.opacity]': 'opacity()',
    '[class.invisible]': 'opacity() === 0',
    '(window:scroll)': 'onScroll()',
    '(window:resize)': 'onScroll()',
  },
})
export class HeroSection {
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');

  protected readonly opacity = signal(1);

  constructor() {
    // Si la página se abre ya bajada (recarga o enlace a #tickets), el hero empieza oculto
    afterNextRender(() => this.onScroll());
  }

  protected onScroll() {
    const opacity = Math.max(0, Math.min(1, 1 - window.scrollY / (window.innerHeight * FADE_DISTANCE)));
    this.opacity.set(opacity);

    // Con el hero oculto no tiene sentido seguir decodificando el vídeo
    const video = this.video()?.nativeElement;
    if (!video) return;
    if (opacity === 0 && !video.paused) {
      video.pause();
    } else if (opacity > 0 && video.paused) {
      video.play().catch(() => {
        // El navegador puede bloquear la reproducción (ahorro de datos, batería); se queda el póster
      });
    }
  }
}
