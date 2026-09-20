import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface FooterCategory {
  title: string;
  links: { label: string; path: string; fragment?: string }[];
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.html'
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly footerLinks = signal<FooterCategory[]>([
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
      // No son páginas propias: llevan a su sección de la portada
      links: [
        { label: 'footer.links.camping', path: '/', fragment: 'tickets' },
        { label: 'footer.links.info', path: '/', fragment: 'info' },
        { label: 'footer.links.sponsors', path: '/', fragment: 'sponsors' }
      ]
    },
    {
      title: 'footer.categories.legal',
      links: [
        { label: 'footer.links.privacy', path: '/privacy' },
        { label: 'footer.links.terms', path: '/legal' },
        { label: 'footer.links.cookies', path: '/cookies' }
      ]
    }
  ]);
}
