import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TicketType} from '../../../../core/models/ticket-types';
import {DocumentType} from '../../../../core/models/order-schema';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalizedNamePipe} from '../../../../shared/pipes/localized-name.pipe';
import {splitName} from '../../../../shared/utils/name-utils';

@Component({
  selector: 'app-ticket-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LocalizedNamePipe],
  templateUrl: './ticket-item.html',
  styleUrl: '../attendee-card.css',
})
export class TicketItem {
  // Recibe el grupo de controles específico para este ticket
  @Input({required: true}) ticketForm!: FormGroup;
  @Input({required: true}) ticketTypes: TicketType[] = [];
  @Input({required: true}) documentTypes: DocumentType[] = [];
  // Posición en la lista, para numerar la tarjeta ("Asistente 01")
  @Input() index = 0;
  // El pedido necesita al menos una entrada: con una sola no se ofrece quitarla
  @Input() canRemove = true;
  // Notifica al padre si se pulsa el botón de borrar
  @Output() remove = new EventEmitter<void>();

  protected readonly splitName = splitName;
}
