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
import {CampingApi} from '../../../../core/services/camping-api';
import {TicketProvider} from '../../../../core/services/ticket-provider';
import {ToastService} from '../../../../core/services/toast';
import {Camping} from '../../../../core/models/camping';
import {CampingType} from '../../../../core/models/ticket-types';

/**
 * Interface para tipado estricto del formulario de camping
 */
interface CampingForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  documentType: FormControl<string>;
  documentNumber: FormControl<string>;
  birthDate: FormControl<string>;
  campingTypeId: FormControl<number | null>;
}

@Component({
  selector: 'app-camping-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './camping-edit.html'
})
export class CampingEdit implements OnInit {
  private readonly campingApi = inject(CampingApi);
  private readonly campingProvider = inject(TicketProvider);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Estado del camping y tipos
  camping = signal<Camping | null>(null);
  campingTypes = signal<CampingType[]>([]);
  campingForm!: FormGroup<CampingForm>;

  // Señales para el estado de la UI
  isLoading = signal(false);
  isInitialLoading = signal(true);

  // Opciones para el tipo de documento
  documentTypes = ['DNI', 'NIE', 'PASSPORT'];

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.campingForm = this.fb.group<CampingForm>({
      firstName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      lastName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      documentType: this.fb.control('', [Validators.required]),
      documentNumber: this.fb.control('', [Validators.required, Validators.maxLength(20)]),
      birthDate: this.fb.control('', [Validators.required]),
      campingTypeId: this.fb.control<number | null>(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    // 1. Cargar tipos de entrada primero para poder mapear después si es edición
    this.campingProvider.getCampingTypes().subscribe({
      next: (types) => {
        this.campingTypes.set(types);

        // 2. Una vez cargados los tipos, miramos si hay ID para editar
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadCamping(id);
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

  loadCamping(id: string): void {
    this.campingApi.getCampingById(+id).subscribe({
      next: (data) => {
        this.camping.set(data);

        // Buscamos el ID del tipo de camping por su nombre para el select
        const typeId = this.campingTypes().find(t => t.name === data.campingTypeName)?.id || null;

        this.campingForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          birthDate: data.birthDate,
          campingTypeId: typeId
        });

        this.isInitialLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show('Error al cargar el camping', 'error');
        this.isInitialLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.campingForm.valid) {
      this.isLoading.set(true);
      const currentCamping = this.camping();
      const formData = this.campingForm.getRawValue();

      const request = currentCamping
        ? this.campingApi.updateCamping(currentCamping.id, formData as any)
        : this.campingApi.createCamping(formData as any);

      request.subscribe({
        next: () => {
          this.toast.show(
            currentCamping ? 'Entrada actualizada correctamente' : 'Entrada creada correctamente',
            'success'
          );
          void this.router.navigate(['/admin/campings']);
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
