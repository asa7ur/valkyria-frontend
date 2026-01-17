import {Component, OnInit, inject, signal, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl
} from '@angular/forms';
import {TicketApi} from '../../../../core/services/ticket-api';
import {TicketProvider} from '../../../../core/services/ticket-provider';
import {ToastService} from '../../../../core/services/toast';
import {Ticket} from '../../../../core/models/ticket';
import {TicketType} from '../../../../core/models/ticket-types';

/**
 * Interface para tipado estricto del formulario de ticket
 */
interface TicketForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  documentType: FormControl<string>;
  documentNumber: FormControl<string>;
  birthDate: FormControl<string>;
  ticketTypeId: FormControl<number | null>;
}

@Component({
  selector: 'app-ticket-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-edit.html'
})
export class TicketEdit implements OnInit {
  private readonly ticketApi = inject(TicketApi);
  private readonly ticketProvider = inject(TicketProvider);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Estado del ticket y tipos
  ticket = signal<Ticket | null>(null);
  ticketTypes = signal<TicketType[]>([]);
  ticketForm!: FormGroup<TicketForm>;

  // Señales para el estado de la UI
  isLoading = signal(false);
  isInitialLoading = signal(true);

  // Opciones para el tipo de documento
  documentTypes = ['DNI', 'NIE', 'PASSPORT'];

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.ticketForm = this.fb.group<TicketForm>({
      firstName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      lastName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      documentType: this.fb.control('', [Validators.required]),
      documentNumber: this.fb.control('', [Validators.required, Validators.maxLength(20)]),
      birthDate: this.fb.control('', [Validators.required]),
      ticketTypeId: this.fb.control<number | null>(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    // 1. Cargar tipos de entrada primero para poder mapear después si es edición
    this.ticketProvider.getTicketTypes().subscribe({
      next: (types) => {
        this.ticketTypes.set(types);

        // 2. Una vez cargados los tipos, miramos si hay ID para editar
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadTicket(id);
        } else {
          this.isInitialLoading.set(false);
        }
      },
      error: () => {
        this.toast.show('Error al cargar tipos de entrada', 'error');
        this.isInitialLoading.set(false);
      }
    });
  }

  loadTicket(id: string): void {
    this.ticketApi.getTicketById(+id).subscribe({
      next: (data) => {
        this.ticket.set(data);

        // Buscamos el ID del tipo de ticket por su nombre para el select
        const typeId = this.ticketTypes().find(t => t.name === data.ticketTypeName)?.id || null;

        this.ticketForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          birthDate: data.birthDate,
          ticketTypeId: typeId
        });

        this.isInitialLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show('Error al cargar el ticket', 'error');
        this.isInitialLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.isLoading.set(true);
      const currentTicket = this.ticket();
      const formData = this.ticketForm.getRawValue();

      const request = currentTicket
        ? this.ticketApi.updateTicket(currentTicket.id, formData as any)
        : this.ticketApi.createTicket(formData as any);

      request.subscribe({
        next: () => {
          this.toast.show(
            currentTicket ? 'Entrada actualizada correctamente' : 'Entrada creada correctamente',
            'success'
          );
          void this.router.navigate(['/admin/tickets']);
        },
        error: (err) => {
          this.isLoading.set(false);
          // Capturamos el error específico del backend (ej: @IsAdult)
          const errorMsg = err.error?.message || 'Error al guardar los datos';
          this.toast.show(errorMsg, 'error');
        }
      });
    }
  }
}
