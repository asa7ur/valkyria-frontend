import {Component, OnInit, inject, signal, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import {StageApi} from '../../../../core/services/stage-api';
import {ToastService} from '../../../../core/services/toast';
import {Stage} from '../../../../core/models/stage';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

interface StageForm {
  name: FormControl<string>;
  capacity: FormControl<number>;
}

@Component({
  selector: 'app-stage-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './stage-edit.html'
})
export class StageEdit implements OnInit {
  private readonly stageApi = inject(StageApi);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected stage = signal<Stage | null>(null);

  protected stageForm!: FormGroup<StageForm>;
  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isEditMode = signal(false);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.stageForm = this.fb.group<StageForm>({
      name: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      capacity: this.fb.control(0, [Validators.required, Validators.min(1)])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadStage(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  private loadStage(id: string): void {
    this.stageApi.getStageById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;

          this.stage.set(data);
          this.stageForm.patchValue(data);
          this.isInitialLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al cargar el escenario', 'error');
          void this.router.navigate(['/admin/stages']);
        }
      });
  }

  protected onSubmit(): void {
    if (this.stageForm.invalid) {
      this.stageForm.markAllAsTouched();
      this.toast.show('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    this.isLoading.set(true);
    const data = this.stageForm.getRawValue();
    const currentStage = this.stage();
    
    const request = currentStage && currentStage.id
      ? this.stageApi.updateStage(currentStage.id, data)
      : this.stageApi.createStage(data);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show(
            currentStage?.id ? 'Escenario actualizado correctamente' : 'Escenario creado correctamente',
            'success'
          );
          void this.router.navigate(['/admin/stages']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || 'Error al guardar los datos';
          this.toast.show(errorMsg, 'error');
        }
      });
  }
}
