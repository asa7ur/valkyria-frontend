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
import {CampingTypeApi} from '../../../../core/services/camping-type-api';
import {ToastService} from '../../../../core/services/toast';
import {CampingType} from '../../../../core/models/ticket-types';

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
  private readonly cdr = inject(ChangeDetectorRef);

  campingType = signal<CampingType | null>(null);
  campingTypeForm!: FormGroup<CampingTypeForm>;
  isLoading = signal(false);
  isInitialLoading = signal(true);

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
      this.loadCampingType(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  loadCampingType(id: string): void {
    this.api.getCampingTypeById(+id).subscribe({
      next: (response) => {
        const data = response.data;
        this.campingType.set(data);
        this.campingTypeForm.patchValue(data);
        this.isInitialLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show('Error al cargar el tipo de camping', 'error');
        this.isInitialLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.campingTypeForm.valid) {
      this.isLoading.set(true);
      const current = this.campingType();
      const formData = this.campingTypeForm.getRawValue();

      const request = current
        ? this.api.updateCampingType(current.id, formData)
        : this.api.createCampingType(formData);

      request.subscribe({
        next: () => {
          this.toast.show(
            current ? 'Tipo actualizado correctamente' : 'Tipo creado correctamente',
            'success'
          );
          void this.router.navigate(['/admin/camping-types']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toast.show(err.error?.message || 'Error al guardar los datos', 'error');
        }
      });
    }
  }
}
