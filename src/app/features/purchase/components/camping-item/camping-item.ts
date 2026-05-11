import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CampingType} from '../../../../core/models/ticket-types';
import {DocumentType} from '../../../../core/models/order-schema';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalizedNamePipe} from '../../../../shared/pipes/localized-name.pipe';

@Component({
  selector: 'app-camping-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LocalizedNamePipe],
  templateUrl: './camping-item.html',
})
export class CampingItem {
  @Input({required: true}) campingForm!: FormGroup;
  @Input({required: true}) campingTypes: CampingType[] = [];
  @Input({required: true}) documentTypes: DocumentType[] = [];
  @Output() remove = new EventEmitter<void>();
}
