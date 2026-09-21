import {Component, DestroyRef, ElementRef, afterNextRender, inject, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

// Fotogramas del aftermovie de Valkyria (public/experience/01.webp ... 12.webp)
const PHOTOS = Array.from({length: 12}, (_, i) => `experience/${String(i + 1).padStart(2, '0')}.webp`);
// Cada cuánto uno de los recuadros funde a otra foto
const SWAP_INTERVAL_MS = 3200;

// Cada recuadro tiene dos capas de imagen: la nueva foto se carga en la oculta y aparece con un fundido
interface Tile {
  a: number;
  b: number;
  showB: boolean;
}

@Component({
  selector: 'app-experience-section',
  imports: [
    TranslatePipe
  ],
  templateUrl: './experience-section.html',
  styleUrl: './experience-section.css',
})
export class ExperienceSection {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly photos = PHOTOS;
  protected readonly tiles = signal<Tile[]>([0, 1, 2, 3].map(i => ({a: i, b: i, showB: false})));
  private lastSwapped = -1;

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Los cambios solo empiezan cuando la sección se ve, y se precargan las fotos para que el fundido
      // nunca muestre un recuadro vacío
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        PHOTOS.forEach(src => new Image().src = src);
        const timer = setInterval(() => this.swapRandomTile(), SWAP_INTERVAL_MS);
        this.destroyRef.onDestroy(() => clearInterval(timer));
      }, {threshold: 0.2});
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected visibleIndex(tile: Tile): number {
    return tile.showB ? tile.b : tile.a;
  }

  private swapRandomTile() {
    const tiles = this.tiles();

    let slot: number;
    do {
      slot = Math.floor(Math.random() * tiles.length);
    } while (slot === this.lastSwapped);
    this.lastSwapped = slot;

    // Una foto que no esté ya en ningún recuadro
    const inUse = new Set(tiles.map(tile => this.visibleIndex(tile)));
    const free = PHOTOS.map((_, i) => i).filter(i => !inUse.has(i));
    const next = free[Math.floor(Math.random() * free.length)];

    this.tiles.update(current => current.map((tile, i) => {
      if (i !== slot) return tile;
      return tile.showB ? {...tile, a: next, showB: false} : {...tile, b: next, showB: true};
    }));
  }
}
