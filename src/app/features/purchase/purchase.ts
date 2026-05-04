// valkyria-frontend-develop/src/app/features/purchase/purchase.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TicketItem } from './components/ticket-item/ticket-item';
import { CampingItem } from './components/camping-item/camping-item';
import { TicketProvider } from '../../core/services/ticket-provider';
import { CheckoutLogic } from '../../core/services/checkout-logic';
import { CampingType, TicketType } from '../../core/models/ticket-types';
import { DocumentType, OrderCreateDTO } from '../../core/models/order-schema';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, NgClass, ReactiveFormsModule, RouterModule, TicketItem, CampingItem],
  templateUrl: './purchase.html',
})
export class Purchase implements OnInit {
  private fb = inject(FormBuilder);
  private provider = inject(TicketProvider);
  private cart = inject(CheckoutLogic);
  private router = inject(Router);

  protected isLoading = signal<boolean>(true);
  public purchaseForm!: FormGroup;

  protected ticketTypes: TicketType[] = [];
  protected campingTypes: CampingType[] = [];
  protected documentTypes: DocumentType[] = Object.values(DocumentType);

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.purchaseForm = this.fb.group({
      tickets: this.fb.array([]),
      campings: this.fb.array([])
    });
  }

  private loadInitialData(): void {
    this.isLoading.set(true);

    forkJoin({
      tickets: this.provider.getTicketTypes(),
      campings: this.provider.getCampingTypes()
    }).subscribe({
      next: (res) => {
        this.ticketTypes = res.tickets;
        this.campingTypes = res.campings;

        // Una vez tenemos los tipos, poblamos con lo que haya en la cesta
        const currentOrder = this.cart.getOrder();
        if (currentOrder.tickets.length > 0 || currentOrder.campings.length > 0) {
          this.populateForm(currentOrder);
        } else {
          this.addTicket(); // Siempre empezamos con al menos una entrada
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading ticket data:', err);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(order: OrderCreateDTO) {
    order.tickets.forEach(t => this.tickets.push(this.createAttendeeGroup(t, 'ticketTypeId')));
    order.campings.forEach(c => this.campings.push(this.createAttendeeGroup(c, 'campingTypeId')));
  }

  private createAttendeeGroup(data: any = {}, idKey: 'ticketTypeId' | 'campingTypeId'): FormGroup {
    return this.fb.group({
      firstName: [data.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [data.lastName || '', [Validators.required, Validators.minLength(2)]],
      documentType: [data.documentType || '', Validators.required],
      documentNumber: [data.documentNumber || '', Validators.required],
      birthDate: [data.birthDate || '', Validators.required],
      [idKey]: [data[idKey] || '', Validators.required]
    });
  }

  // Getters para facilitar el acceso a los FormArrays
  get tickets() { return this.purchaseForm.get('tickets') as FormArray; }
  get campings() { return this.purchaseForm.get('campings') as FormArray; }

  addTicket() { this.tickets.push(this.createAttendeeGroup({}, 'ticketTypeId')); }
  removeTicket(index: number) { this.tickets.removeAt(index); }

  addCamping() { this.campings.push(this.createAttendeeGroup({}, 'campingTypeId')); }
  removeCamping(index: number) { this.campings.removeAt(index); }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      this.cart.setOrder(this.purchaseForm.value);
      this.router.navigate(['/purchase/checkout']);
    } else {
      this.purchaseForm.markAllAsTouched();
    }
  }
}
