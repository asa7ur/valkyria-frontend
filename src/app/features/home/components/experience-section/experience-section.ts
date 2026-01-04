import {afterNextRender, Component, signal} from '@angular/core';

@Component({
  selector: 'app-experience-section',
  imports: [],
  templateUrl: './experience-section.html',
  styles: ``,
})
export class ExperienceSection {
// Índice de la imagen actual
  protected currentIndex = signal(0);

  // Imágenes de ejemplo (sustitúyelas por fotos de tu festival)
  protected images = signal([
    'https://images.unsplash.com/photo-1619229665486-19f7ee2987a5?q=80&w=2070',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070',
    'https://images.unsplash.com/photo-1604515438635-fd331c877a6b?q=80&w=2070',
    'https://images.unsplash.com/photo-1750502283039-23d7979b5289?q=80&w=2070'
  ]);

  private intervalId: any;

  constructor() {
    // Iniciamos el movimiento automático solo en el navegador
    afterNextRender(() => {
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 4000); // Cambia cada 4 segundos
    });
  }

  nextSlide() {
    this.currentIndex.update(index => (index + 1) % this.images().length);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
