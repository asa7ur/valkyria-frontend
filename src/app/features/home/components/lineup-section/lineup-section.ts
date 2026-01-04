import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-lineup-section',
  imports: [],
  templateUrl: './lineup-section.html',
  styles: ``,
})
export class LineupSection {
  protected readonly artists = signal([
    'Slipknot', 'Rammstein', 'Meshuggah', 'Gojira',
    'Opeth', 'Deftones', 'Metallica', 'Loathe',
    'Iron Maiden', 'Alice in Chains', 'Wardruna', 'Limp Bizkit',
    'Knocked Loose', 'Soen', 'Vola', 'Acid Bath'
  ]);
}
