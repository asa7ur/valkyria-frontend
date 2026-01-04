import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styles: ``,
})
export class Footer {
  protected readonly currentYear = signal(new Date().getFullYear());

  protected readonly infoLinks = signal(['General Info', 'Ticketing', 'FAQ']);
  protected readonly legalLinks = signal(['Legal Notice', 'General Terms & Conditions']);
}
