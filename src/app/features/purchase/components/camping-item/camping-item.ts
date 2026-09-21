import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CampingType} from '../../../../core/models/ticket-types';
import {DocumentType} from '../../../../core/models/order-schema';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalizedNamePipe} from '../../../../shared/pipes/localized-name.pipe';
import {splitName} from '../../../../shared/utils/name-utils';

@Component({
  selector: 'app-camping-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LocalizedNamePipe],
  templateUrl: './camping-item.html',
  styleUrl: '../attendee-card.css',
})
export class CampingItem {
  @Input({required: true}) campingForm!: FormGroup;
  @Input({required: true}) campingTypes: CampingType[] = [];
  @Input({required: true}) documentTypes: DocumentType[] = [];
  // Posición en la lista, para numerar la tarjeta ("Reserva 01")
  @Input() index = 0;
  // El camping es opcional: siempre se puede quitar
  @Input() canRemove = true;
  @Output() remove = new EventEmitter<void>();

  protected readonly splitName = splitName;
}
