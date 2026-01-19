import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TicketTypeApi} from '../../../core/services/ticket-type-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {TicketType} from '../../../core/models/ticket-types';

@Component({
  selector: 'app-ticket-types-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-types.html'
})
export class TicketTypesAdmin implements OnInit {
  private api = inject(TicketTypeApi);
  private confirmService = inject(ConfirmDialogService);

  ticketTypes = signal<TicketType[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getAllTicketTypes().subscribe({
      next: (data) => {
        this.ticketTypes.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  async deleteType(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Tipo de Entrada',
      message: '¿Estás seguro de que deseas eliminar este tipo? Esto afectará a la disponibilidad del ticket.',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (confirmed) {
      this.api.deleteTicketType(id).subscribe(() => this.loadData());
    }
  }
}
