import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './hero-section.html',
  styles: ``,
})
export class HeroSection {
}
