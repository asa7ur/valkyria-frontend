import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

/** "Al continuar aceptas el aviso legal y la política de privacidad", con enlaces. Va junto a registro y pago. */
@Component({
  selector: 'app-legal-consent',
  imports: [RouterLink, TranslatePipe],
  template: `
    <p class="text-[9px] text-center mt-4 opacity-60 font-bold uppercase tracking-tighter">
      {{ 'legal.consent.prefix' | translate }}
      <a routerLink="/legal" class="underline hover:text-red-600 transition-colors">{{ 'legal.consent.notice' | translate }}</a>
      {{ 'legal.consent.and' | translate }}
      <a routerLink="/privacy" class="underline hover:text-red-600 transition-colors">{{ 'legal.consent.privacy' | translate }}</a>
    </p>
  `
})
export class LegalConsent {
}
