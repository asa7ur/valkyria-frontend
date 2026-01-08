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
      title: $localize`:@@footer.category.festival:Festival`,
      links: [
        {label: $localize`:@@footer.link.lineup:Lineup`, path: '/lineup'},
        {label: $localize`:@@footer.link.artists:Artistas`, path: '/artists'},
        {label: $localize`:@@footer.link.tickets:Entradas`, path: '/purchase'}
      ]
    },
    {
      title: $localize`:@@footer.category.experience:Experiencia`,
      links: [
        {label: $localize`:@@footer.link.camping:Camping`, path: '/camping'},
        {label: $localize`:@@footer.link.info:Información`, path: '/info'},
        {label: $localize`:@@footer.link.sponsors:Patrocinadores`, path: '/sponsors'}
      ]
    },
    {
      title: $localize`:@@footer.category.legal:Legal`,
      links: [
        {label: $localize`:@@footer.link.privacy:Política de Privacidad`, path: '/privacy'},
        {label: $localize`:@@footer.link.terms:Términos y Condiciones`, path: '/terms'},
        {label: $localize`:@@footer.link.cookies:Cookies`, path: '/cookies'}
      ]
    }
  ]);
}
