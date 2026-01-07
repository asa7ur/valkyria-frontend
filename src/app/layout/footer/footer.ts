import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html'
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly footerLinks = signal([
    {
      title: 'Festival',
      links: [
        {label: 'Line-up', path: '/lineup'},
        {label: 'Artists', path: '/artists'},
        {label: 'Tickets', path: '/purchase'}
      ]
    },
    {
      title: 'Experience',
      links: [
        {label: 'Camping', path: '/camping'},
        {label: 'Info', path: '/info'},
        {label: 'Sponsors', path: '/sponsors'}
      ]
    },
    {
      title: 'Legal',
      links: [
        {label: 'Privacy Policy', path: '/privacy'},
        {label: 'Terms & Conditions', path: '/terms'},
        {label: 'Cookies', path: '/cookies'}
      ]
    }
  ]);
}
