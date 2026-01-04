import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-tickets-section',
  imports: [],
  templateUrl: './tickets-section.html',
  styles: ``,
})
export class TicketsSection {
  protected readonly tickets = signal([
    {type: 'General Pass', price: '155€', duration: '4 DAYS'},
    {type: 'VIP Pass', price: '280€', duration: '4 DAYS'},
    {type: 'Gold Pass', price: '450€', duration: '4 DAYS'},
    {type: 'Camping Plus', price: '60€', duration: '4 DAYS'}
  ]);
}
