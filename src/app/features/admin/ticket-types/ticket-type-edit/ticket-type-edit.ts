import {Component, OnInit, inject, signal, ChangeDetectorRef, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl
} from '@angular/forms';
import {TicketTypeApi} from '../../../../core/services/ticket-type-api';
import {ToastService} from '../../../../core/services/toast';
import {TicketType} from '../../../../core/models/ticket-types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

interface TicketTypeForm {
  name: FormControl<string>;
  nameEn: FormControl<string>;
  price: FormControl<number>;
  stockTotal: FormControl<number>;
  stockAvailable: FormControl<number>;
}

@Component({
  selector: 'app-ticket-type-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-type-edit.html'
})
export class TicketTypeEdit implements OnInit {
  private readonly api = inject(TicketTypeApi);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected ticketType = signal<TicketType | null>(null);
  protected ticketTypeForm!: FormGroup<TicketTypeForm>;
  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isEditMode = signal(false);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.ticketTypeForm = this.fb.group<TicketTypeForm>({
      name: this.fb.control('', [Validators.required, Validators.maxLength(50)]),
      nameEn: this.fb.control('', [Validators.maxLength(50)]),
      price: this.fb.control(0, [Validators.required, Validators.min(0)]),
      stockTotal: this.fb.control(0, [Validators.required, Validators.min(0)]),
      stockAvailable: this.fb.control(0, [Validators.required, Validators.min(0)])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadTicketType(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  private loadTicketType(id: string): void {
    this.api.getTicketTypeById(+id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data;
          this.ticketType.set(data);
          this.ticketTypeForm.patchValue(data);
          this.isInitialLoading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.show('Error al cargar el tipo de ticket', 'error');
          this.isInitialLoading.set(false);
          void this.router.navigate(['/admin/ticket-types']);
        }
      });
  }

  protected onSubmit(): void {
    if (this.ticketTypeForm.invalid) {
      this.ticketTypeForm.markAllAsTouched();
      this.toast.show('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    this.isLoading.set(true);
    const current = this.ticketType();
    const formData = this.ticketTypeForm.getRawValue();

    const request = current
      ? this.api.updateTicketType(current.id, formData)
      : this.api.createTicketType(formData);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show(
            current ? 'Tipo actualizado correctamente' : 'Tipo creado correctamente',
            'success'
          );
          void this.router.navigate(['/admin/ticket-types']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || 'Error al guardar los datos';
          this.toast.show(errorMsg, 'error');
        }
      });
  }
}
