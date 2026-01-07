import {Component, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero-section.html',
  styles: ``,
})
export class HeroSection implements AfterViewInit {
  // Referencia al elemento video
  @ViewChild('heroVideo') videoElement!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    // Intentamos reproducir manualmente por si el autoplay falló
    const video = this.videoElement.nativeElement;
    video.muted = true; // Aseguramos que esté silenciado (requisito para autoplay)

    video.play().catch(err => {
      console.warn("Autoplay bloqueado inicialmente, reintentando...", err);
    });
  }
}
