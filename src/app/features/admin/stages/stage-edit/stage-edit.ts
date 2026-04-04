import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import {StageApi} from '../../../../core/services/stage-api';
import {ToastService} from '../../../../core/services/toast';
import {Stage} from '../../../../core/models/stage';

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

  stage = signal<Stage | null>(null);
  stageForm!: FormGroup<StageForm>;
  isLoading = signal(false);
  isInitialLoading = signal(true);
  isEditMode = signal(false);

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

  loadStage(id: string): void {
    this.stageApi.getStageById(id).subscribe({
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

  onSubmit(): void {
    if (this.stageForm.invalid) return;

    this.isLoading.set(true);
    const data = this.stageForm.getRawValue();
    const request = this.isEditMode()
      ? this.stageApi.updateStage(this.stage()!.id, data)
      : this.stageApi.createStage(data);

    request.subscribe({
      next: () => {
        this.toast.show(this.isEditMode() ? 'Escenario actualizado' : 'Escenario creado', 'success');
        void this.router.navigate(['/admin/stages']);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.show('Error al guardar los datos', 'error');
      }
    });
  }
}
