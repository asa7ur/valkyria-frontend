import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.html'
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly footerLinks = signal([
    {
      title: 'footer.categories.festival',
      links: [
        { label: 'footer.links.lineup', path: '/lineup' },
        { label: 'footer.links.artists', path: '/artists' },
        { label: 'footer.links.tickets', path: '/purchase' }
      ]
    },
    {
      title: 'footer.categories.experience',
      links: [
        { label: 'footer.links.camping', path: '/camping' },
        { label: 'footer.links.info', path: '/info' },
        { label: 'footer.links.sponsors', path: '/sponsors' }
      ]
    },
    {
      title: 'footer.categories.legal',
      links: [
        { label: 'footer.links.privacy', path: '/privacy' },
        { label: 'footer.links.terms', path: '/terms' },
        { label: 'footer.links.cookies', path: '/cookies' }
      ]
    }
  ]);
}
