import {Component, signal, OnInit, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('valkyria-frontend');

  // Estado para controlar la existencia de la pantalla de carga
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
