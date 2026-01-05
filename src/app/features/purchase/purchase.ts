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
    // Agregamos un ticket por defecto para que la pantalla no aparezca vacía
    this.addTicket();
  }

  private initForm(): void {
    this.purchaseForm = this.fb.group({
      tickets: this.fb.array([]),
      campings: this.fb.array([])
    });
  }

  private loadData(): void {
    this.ticketService.getTicketTypes().subscribe({
      next: (types) => this.ticketTypes = types,
      error: (err) => console.error('Error cargando tipos de tickets', err)
    });

    this.ticketService.getCampingTypes().subscribe({
      next: (types) => this.campingTypes = types,
      error: (err) => console.error('Error cargando tipos de camping', err)
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
      campingTypeId: [null, Validators.required]
    });
    this.campings.push(campingGroup);
  }

  removeCamping(index: number): void {
    this.campings.removeAt(index);
  }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      const orderData = this.purchaseForm.value;
      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          console.log('Pedido creado con éxito', response);
          this.router.navigate(['/purchase/success']); // Ajusta según tu ruta de éxito
        },
        error: (err) => {
          console.error('Error al procesar la orden:', err);
          alert('Hubo un problema al tramitar tu pedido.');
        }
      });
    } else {
      this.purchaseForm.markAllAsTouched();
    }
  }
}
