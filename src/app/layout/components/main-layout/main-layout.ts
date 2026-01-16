import {Component, signal, OnInit} from '@angular/core';
import {Header} from '../../header/header';
import {RouterOutlet} from '@angular/router';
import {Footer} from '../../footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [
    Header,
    RouterOutlet,
    Footer,
  ],
  templateUrl: './main-layout.html',
  styles: ``,
})
export class MainLayout implements OnInit {
  showSplash = signal(true);
  // Estado para activar la animación de desvanecimiento (fade-out)
  isFadingOut = signal(false);

  ngOnInit() {
    // 1. Duración del logo pulsando (2.5 segundos)
    setTimeout(() => {
      this.isFadingOut.set(true); // Iniciamos el desvanecimiento suave

      // 2. Esperamos a que termine la transición de CSS (800ms) para eliminarlo del DOM
      setTimeout(() => {
        this.showSplash.set(false);
      }, 800);
    }, 2000);
  }
}
