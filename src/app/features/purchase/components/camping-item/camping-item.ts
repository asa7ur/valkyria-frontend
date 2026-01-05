import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DocumentType} from '../../../../core/models/order.model';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CampingType} from '../../../../core/models/ticket.model';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-camping-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './camping-item.html',
})
export class CampingItem {
  @Input({required: true}) campingForm!: FormGroup;
  @Input({required: true}) campingTypes: CampingType[] = [];
  @Input({required: true}) documentTypes: DocumentType[] = [];
  @Output() remove = new EventEmitter<void>();
}
