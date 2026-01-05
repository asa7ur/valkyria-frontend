import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CampingType} from '../../../../core/models/ticket.model';
import {DocumentType} from '../../../../core/models/order.model';

@Component({
  selector: 'app-camping-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './camping-item.html',
})
export class CampingItem {
  @Input({required: true}) campingForm!: FormGroup;
  @Input({required: true}) campingTypes: CampingType[] = [];
  @Input({required: true}) documentTypes: DocumentType[] = [];
  @Output() remove = new EventEmitter<void>();
}
