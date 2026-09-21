import {Component, DestroyRef, ElementRef, afterNextRender, inject, OnInit, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Artist} from '../../../../core/models/artist';
import {RouterLink} from '@angular/router';
import {ResponseDTO} from '../../../../core/models/response-dto';
import {environment} from '../../../../../environments/environment';
import {TranslatePipe} from '@ngx-translate/core';

// Cada cuánto el foco "pilla" a otro grupo al azar
const SPOTLIGHT_INTERVAL_MS = 1800;
// Logos que se ven por debajo de 1024 px (rejilla de 3 columnas); en escritorio se ven todos
const MOBILE_LOGO_LIMIT = 15;

@Component({
  selector: 'app-lineup-section',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './lineup-section.html',
  styleUrl: './lineup-section.css',
})
export class LineupSection implements OnInit {
  private http = inject(HttpClient);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly artists = signal<Artist[]>([]);
  private readonly baseUrl = `${environment.apiUrl}/uploads/artists/`;

  // Los logos aparecen al entrar la sección en pantalla
  protected readonly revealed = signal(false);
  // Índice del logo iluminado por el foco (-1: ninguno)
  protected readonly litIndex = signal(-1);
  protected readonly mobileLimit = MOBILE_LOGO_LIMIT;

  constructor() {
    afterNextRender(() => {
      const section = this.host.nativeElement.querySelector('section');
      if (!section) return;

      this.observeReveal(section);
      this.followPointer(section);

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const timer = setInterval(() => this.moveSpotlight(), SPOTLIGHT_INTERVAL_MS);
        this.destroyRef.onDestroy(() => clearInterval(timer));
      }
    });
  }

  ngOnInit() {
    this.http.get<ResponseDTO<Artist[]>>(`${environment.apiUrl}/api/v1/artists/logo`)
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

  private moveSpotlight() {
    // Solo entre los logos visibles: en móvil los que pasan de MOBILE_LOGO_LIMIT están ocultos
    const visible = window.matchMedia('(min-width: 1024px)').matches ? Infinity : MOBILE_LOGO_LIMIT;
    const count = Math.min(this.artists().length, visible);
    if (!this.revealed() || count < 2) return;
    let next: number;
    do {
      next = Math.floor(Math.random() * count);
    } while (next === this.litIndex());
    this.litIndex.set(next);
  }

  private observeReveal(section: HTMLElement) {
    if (!('IntersectionObserver' in window)) {
      this.revealed.set(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.revealed.set(true);
        observer.disconnect();
      }
    }, {threshold: 0.15});
    observer.observe(section);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  // Halo que sigue al ratón. Se escribe directamente en variables CSS para no redibujar el componente
  // en cada movimiento.
  private followPointer(section: HTMLElement) {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      section.style.setProperty('--my', `${event.clientY - rect.top}px`);
      section.classList.add('pointer-inside');
    };
    const onLeave = () => section.classList.remove('pointer-inside');

    section.addEventListener('pointermove', onMove, {passive: true});
    section.addEventListener('pointerleave', onLeave);
    this.destroyRef.onDestroy(() => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
    });
  }
}
