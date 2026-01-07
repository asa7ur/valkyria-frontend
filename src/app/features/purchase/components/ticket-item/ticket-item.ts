import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TicketType} from '../../../../core/models/ticket-types';
import {DocumentType} from '../../../../core/models/order-schema';

@Component({
  selector: 'app-ticket-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-item.html',
})
export class TicketItem {
  // Recibe el grupo de controles específico para este ticket
  @Input({required: true}) ticketForm!: FormGroup;
  @Input({required: true}) ticketTypes: TicketType[] = [];
  @Input({required: true}) documentTypes: DocumentType[] = [];
  // Notifica al padre si se pulsa el botón de borrar
  @Output() remove = new EventEmitter<void>();
}
