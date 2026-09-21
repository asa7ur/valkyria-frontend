import {Component, DestroyRef, ElementRef, afterNextRender, inject, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {randomInt} from '../../../../shared/utils/random-utils';

// Fotos del festival (public/experience/01.webp ... 11.webp). Cada recuadro del mosaico tiene otra proporción,
// así que la foto se recorta con object-cover alrededor de su punto de interés (la cara o el gesto principal).
interface Photo {
  src: string;
  focus: string;
}

const PHOTOS: Photo[] = [
  {src: 'experience/01.webp', focus: '50% 40%'},
  {src: 'experience/02.webp', focus: '50% 35%'},
  {src: 'experience/03.webp', focus: '50% 30%'},
  {src: 'experience/04.webp', focus: '40% 30%'},
  {src: 'experience/05.webp', focus: '50% 45%'},
  {src: 'experience/06.webp', focus: '50% 55%'},
  {src: 'experience/07.webp', focus: '45% 40%'},
  {src: 'experience/08.webp', focus: '50% 25%'},
  {src: 'experience/09.webp', focus: '50% 55%'},
  {src: 'experience/10.webp', focus: '50% 35%'},
  {src: 'experience/11.webp', focus: '50% 30%'},
];
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
        PHOTOS.forEach(photo => new Image().src = photo.src);
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
      slot = randomInt(tiles.length);
    } while (slot === this.lastSwapped);
    this.lastSwapped = slot;

    // Una foto que no esté ya en ningún recuadro
    const inUse = new Set(tiles.map(tile => this.visibleIndex(tile)));
    const free = PHOTOS.map((_, i) => i).filter(i => !inUse.has(i));
    const next = free[randomInt(free.length)];

    this.tiles.update(current => current.map((tile, i) => {
      if (i !== slot) return tile;
      return tile.showB ? {...tile, a: next, showB: false} : {...tile, b: next, showB: true};
    }));
  }
}
