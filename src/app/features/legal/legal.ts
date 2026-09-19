import {Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {map, switchMap} from 'rxjs';

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalDocument {
  title: string;
  sections: LegalSection[];
}

/**
 * Páginas legales (aviso legal, privacidad y cookies). El documento lo indica la ruta (data.doc) y el texto
 * sale de las traducciones (legal.<doc>), así que cambia de idioma igual que el resto de la web.
 */
@Component({
  selector: 'app-legal',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './legal.html'
})
export class Legal {
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  private doc = toSignal(this.route.data.pipe(
    switchMap(data => this.translate.stream(`legal.${data['doc']}`)),
    map(value => (typeof value === 'object' ? value : null) as LegalDocument | null)
  ));

  title = computed(() => this.doc()?.title ?? '');
  sections = computed(() => this.doc()?.sections ?? []);
}
