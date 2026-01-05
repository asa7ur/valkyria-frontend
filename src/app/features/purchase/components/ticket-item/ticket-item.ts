import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TicketType} from '../../../../core/models/ticket.model';
import {DocumentType} from '../../../../core/models/order.model';

@Component({
  selector: 'app-ticket-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-item.html',
})
export class TicketItem {
  @Input({required: true}) ticketForm!: FormGroup;
  @Input({required: true}) ticketTypes: TicketType[] = [];
  @Input({required: true}) documentTypes: DocumentType[] = [];
  @Output() remove = new EventEmitter<void>();
}
