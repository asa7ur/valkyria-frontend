import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {forkJoin} from 'rxjs';

import {TicketItem} from './components/ticket-item/ticket-item';
import {CampingItem} from './components/camping-item/camping-item';
import {TicketProvider} from '../../core/services/ticket-provider';
import {CheckoutLogic} from '../../core/services/checkout-logic';
import {CampingType, TicketType} from '../../core/models/ticket-types';
import {DocumentType} from '../../core/models/order-schema';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TicketItem, CampingItem],
  templateUrl: './purchase.html',
})
export class Purchase implements OnInit {
  private fb = inject(FormBuilder);
  private provider = inject(TicketProvider);
  private cart = inject(CheckoutLogic);
  private router = inject(Router);

  protected isLoading = signal<boolean>(true);
  purchaseForm!: FormGroup;
  ticketTypes: TicketType[] = [];
  campingTypes: CampingType[] = [];
  documentTypes: DocumentType[] = Object.values(DocumentType) as DocumentType[];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.addTicket();
  }

  private initForm(): void {
    this.purchaseForm = this.fb.group({
      tickets: this.fb.array([]),
      campings: this.fb.array([])
    });
  }

  private loadData(): void {
    this.isLoading.set(true);
    // Esperamos a que ambas peticiones terminen
    forkJoin({
      tickets: this.provider.getTicketTypes(),
      campings: this.provider.getCampingTypes()
    }).subscribe({
      next: (res) => {
        this.ticketTypes = res.tickets;
        this.campingTypes = res.campings;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando tipos de entradas:', err);
        this.isLoading.set(false);
      }
    });
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
      ticketTypeId: ['', Validators.required]
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
      campingTypeId: ['', Validators.required]
    });
    this.campings.push(campingGroup);
  }

  removeCamping(index: number): void {
    this.campings.removeAt(index);
  }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      this.cart.setOrder(this.purchaseForm.value);
      this.router.navigate(['/purchase/checkout']);
    } else {
      this.purchaseForm.markAllAsTouched();
    }
  }
}
