import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('valkyria-frontend');

  showSplash = signal(true);

  ngOnInit() {
    // Forzamos que la pantalla dure, por ejemplo, 2.5 segundos
    setTimeout(() => {
      this.showSplash.set(false);
    }, 2500);
  }
}
