import {Component, OnInit, inject, signal, DestroyRef} from '@angular/core';
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
import {Camping, CampingCreateDTO} from '../../../../core/models/camping';
import {CampingType} from '../../../../core/models/ticket-types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  private readonly destroyRef = inject(DestroyRef)

  // Estado del camping y tipos
  protected camping = signal<Camping | null>(null);
  protected campingTypes = signal<CampingType[]>([]);
  protected campingForm!: FormGroup<CampingForm>;

  // Señales para el estado de la UI
  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isEditMode = signal(false);

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
      campingTypeId: this.fb.control<number>(0, [Validators.required])
    });
  }

  ngOnInit(): void {
    // 1. Cargar tipos de entrada primero para poder mapear después si es edición
    this.campingProvider.getCampingTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => {
          this.campingTypes.set(types);

          // 2. Una vez cargados los tipos, miramos si hay ID para editar
          const id = this.route.snapshot.paramMap.get('id');
          if (id) {
            this.isEditMode.set(true);
            this.loadCamping(id);
          } else {
            this.isEditMode.set(false);
            this.isInitialLoading.set(false);
          }
        },
        error: () => {
          this.toast.show('Error al cargar tipos de entrada', 'error');
          this.isInitialLoading.set(false);
        }
      });
  }

  private loadCamping(id: string): void {
    this.campingApi.getCampingById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data;
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
        },
        error: () => {
          this.toast.show('Error al cargar el camping', 'error');
          this.isInitialLoading.set(false);
        }
      });
  }

  protected onSubmit(): void {
    if (this.campingForm.invalid) {
      this.campingForm.markAllAsTouched();
      return;
    }

    const {campingTypeId, ...rest} = this.campingForm.getRawValue();

    if (campingTypeId === null) return;

    const payload: CampingCreateDTO = { ...rest, campingTypeId };
    const currentCamping = this.camping();

    this.isLoading.set(true);

    const request = currentCamping
      ? this.campingApi.updateCamping(currentCamping.id, payload)
      : this.campingApi.createCamping(payload);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
