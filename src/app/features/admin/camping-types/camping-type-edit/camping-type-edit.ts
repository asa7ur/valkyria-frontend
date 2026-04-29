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
import {CampingTypeApi} from '../../../../core/services/camping-type-api';
import {ToastService} from '../../../../core/services/toast';
import {CampingType} from '../../../../core/models/ticket-types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

interface CampingTypeForm {
  name: FormControl<string>;
  price: FormControl<number>;
  stockTotal: FormControl<number>;
  stockAvailable: FormControl<number>;
}

@Component({
  selector: 'app-camping-type-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './camping-type-edit.html'
})
export class CampingTypeEdit implements OnInit {
  private readonly api = inject(CampingTypeApi);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected campingType = signal<CampingType | null>(null);
  protected campingTypeForm!: FormGroup<CampingTypeForm>;
  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isEditMode = signal(false);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.campingTypeForm = this.fb.group<CampingTypeForm>({
      name: this.fb.control('', [Validators.required, Validators.maxLength(50)]),
      price: this.fb.control(0, [Validators.required, Validators.min(0)]),
      stockTotal: this.fb.control(0, [Validators.required, Validators.min(0)]),
      stockAvailable: this.fb.control(0, [Validators.required, Validators.min(0)])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.loadCampingType(id);
    } else {
      this.isEditMode.set(false);
      this.isInitialLoading.set(false);
    }
  }

  private loadCampingType(id: string): void {
    this.api.getCampingTypeById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data;
          this.campingType.set(data);
          this.campingTypeForm.patchValue(data);
          this.isInitialLoading.set(false);
        },
      error: () => {
        this.toast.show('Error al cargar el tipo de camping', 'error');
        this.isInitialLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.campingTypeForm.invalid) {
      this.campingTypeForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const current = this.campingType();
    const formData = this.campingTypeForm.getRawValue();

    if (current) {
      this.api.updateCampingType(current.id, formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Datos del tipo de camping actualizados',  'success');
          void this.router.navigate(['/admin/camping-types']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.show('Error al guardar los datos', 'error');
        }
      });
    } else{
      this.api.createCampingType(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.show('Tipo de camping creado correctamente',  'success');
            void this.router.navigate(['/admin/camping-types']);
          },
          error: () => {
            this.isLoading.set(false);
            this.toast.show('Error al crear el tipo de camping', 'error');
          }
        })
    }
  }
}
