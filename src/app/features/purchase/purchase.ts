import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {TicketItem} from './components/ticket-item/ticket-item';
import {CampingItem} from './components/camping-item/camping-item';
import {TicketService} from '../../core/services/ticket.service';
import {OrderService} from '../../core/services/order.service';
import {CampingType, TicketType} from '../../core/models/ticket.model';
import {DocumentType} from '../../core/models/order.model';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TicketItem,
    CampingItem
  ],
  templateUrl: './purchase.html',
})
export class Purchase implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  purchaseForm!: FormGroup;
  ticketTypes: TicketType[] = [];
  campingTypes: CampingType[] = [];
  documentTypes: DocumentType[] = Object.values(DocumentType) as DocumentType[];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.addTicket(); // Empezamos con uno
  }

  private initForm(): void {
    this.purchaseForm = this.fb.group({
      tickets: this.fb.array([]),
      campings: this.fb.array([])
    });
  }

  private loadData(): void {
    this.ticketService.getTicketTypes().subscribe(types => this.ticketTypes = types);
    this.ticketService.getCampingTypes().subscribe(types => this.campingTypes = types);
  }

  get tickets(): FormArray {
    return this.purchaseForm.get('tickets') as FormArray;
  }

  get campings(): FormArray {
    return this.purchaseForm.get('campings') as FormArray;
  }

  addTicket(): void {
    const ticketGroup = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
      birthDate: ['', Validators.required],
      // CAMBIO: Debe ser ticketTypeId para que el Backend lo reconozca
      ticketTypeId: [null, Validators.required]
    });
    this.tickets.push(ticketGroup);
  }

  removeTicket(index: number): void {
    this.tickets.removeAt(index);
  }

  addCamping(): void {
    const campingGroup = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
      birthDate: ['', Validators.required],
      // CAMBIO: Debe ser campingTypeId
      campingTypeId: [null, Validators.required]
    });
    this.campings.push(campingGroup);
  }

  removeCamping(index: number): void {
    this.campings.removeAt(index);
  }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      // 1. Guardamos los datos en el servicio (el "carrito")
      this.orderService.setOrder(this.purchaseForm.value);

      // 2. Navegamos a la vista de resumen (Checkout)
      this.router.navigate(['/purchase/checkout']);
    } else {
      this.purchaseForm.markAllAsTouched();
      const firstInvalid = document.querySelector('.ng-invalid');
      firstInvalid?.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }
}
