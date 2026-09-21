import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketProvider } from '../../../../core/services/ticket-provider';
import { TicketType, CampingType } from '../../../../core/models/ticket-types';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedNamePipe } from '../../../../shared/pipes/localized-name.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tickets-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizedNamePipe],
  templateUrl: './tickets-section.html',
  styleUrl: './tickets-section.css'
})
export class TicketsSection implements OnInit {
  private ticketProvider = inject(TicketProvider);

  private allTickets = signal<TicketType[]>([]);
  private allCampings = signal<CampingType[]>([]);

  // Combinamos: 2 Tickets + 3 Campings
  protected readonly displayItems = computed(() => {
    const tickets = this.allTickets().slice(0, 2).map(t => ({ ...t, isCamping: false, uid: `t_${t.id}` }));
    const campings = this.allCampings().slice(0, 3).map(c => ({ ...c, isCamping: true, uid: `c_${c.id}` }));
    return [...tickets, ...campings];
  });

  // "Senda del Guerrero (Abono General)" -> título "Senda del Guerrero" y subtítulo "Abono General"
  protected splitName(name: string): {title: string; subtitle: string | null} {
    const match = /^(.*?)\s*\((.+)\)\s*$/.exec(name);
    return match ? {title: match[1], subtitle: match[2]} : {title: name, subtitle: null};
  }

  ngOnInit() {
    forkJoin({
      tickets: this.ticketProvider.getTicketTypes(),
      campings: this.ticketProvider.getCampingTypes()
    }).subscribe({
      next: (data) => {
        this.allTickets.set(data.tickets);
        this.allCampings.set(data.campings);
      },
      error: (err) => console.error('Error:', err)
    });
  }
}
