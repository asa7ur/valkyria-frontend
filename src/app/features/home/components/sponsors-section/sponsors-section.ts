import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-sponsors-section',
  imports: [],
  templateUrl: './sponsors-section.html',
  styles: ``,
})
export class SponsorsSection {
  protected readonly sponsors = signal([
    {name: 'NOSDO AYUNTAMIENTO DE SEVILLA'},
    {name: 'Rock'},
    {name: 'Carrefour'},
    {name: 'Cruzcampo'},
    {name: 'BARCELÓ'},
    {name: 'TIDAL'},
    {name: 'Red Bull'},
    {name: 'Burn'},
    {name: 'ABSOLUT VODKA'}
  ]);
}
