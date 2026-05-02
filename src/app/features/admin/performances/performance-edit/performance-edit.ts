import { ChangeDetectorRef, Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PerformanceApi } from '../../../../core/services/performance-api';
import { ArtistApi } from '../../../../core/services/artist-api';
import { StageApi } from '../../../../core/services/stage-api';
import { ToastService } from '../../../../core/services/toast';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Performance as PerformanceModel } from '../../../../core/models/performance';
import { Artist } from '../../../../core/models/artist';
import { Stage } from '../../../../core/models/stage';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface PerformanceForm {
  artistId: FormControl<number | null>;
  stageId: FormControl<number | null>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
}

@Component({
  selector: 'app-performance-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './performance-edit.html'
})
export class PerformanceEdit implements OnInit {
  private readonly performanceApi = inject(PerformanceApi);
  private readonly artistApi = inject(ArtistApi);
  private readonly stageApi = inject(StageApi);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected performance = signal<PerformanceModel | null>(null);
  protected artists = signal<Artist[]>([]);
  protected stages = signal<Stage[]>([]);

  protected performanceForm!: FormGroup<PerformanceForm>;
  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isEditMode = signal(false);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.performanceForm = this.fb.group<PerformanceForm>({
      artistId: this.fb.control(null, [Validators.required]),
      stageId: this.fb.control(null, [Validators.required]),
      startTime: this.fb.control('', [Validators.required]),
      endTime: this.fb.control('', [Validators.required])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadDependencies();
    if (id) {
      this.isEditMode.set(true);
      this.loadPerformance(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  private loadDependencies(): void {
    this.artistApi.getArtists(0, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.artists.set(res.data || []));
      
    this.stageApi.getStages(0, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.stages.set(res.data || []));
  }

  private loadPerformance(id: string): void {
    this.performanceApi.getPerformanceById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data;

          this.performance.set(data);
          this.performanceForm.patchValue({
            artistId: data.artist.id,
            stageId: data.stage.id,
            startTime: data.startTime,
            endTime: data.endTime
          });

          this.isInitialLoading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.show('Error al cargar la actuación', 'error');
          this.isInitialLoading.set(false);
          void this.router.navigate(['/admin/performances']);
        }
      });
  }

  protected onSubmit(): void {
    if (this.performanceForm.invalid) {
      this.performanceForm.markAllAsTouched();
      this.toast.show('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    this.isLoading.set(true);
    const currentPerformance = this.performance();
    const formData = this.performanceForm.getRawValue();

    const request = currentPerformance && currentPerformance.id
      ? this.performanceApi.updatePerformance(currentPerformance.id, formData)
      : this.performanceApi.createPerformance(formData);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show(
            currentPerformance?.id ? 'Actuación actualizada correctamente' : 'Actuación creada correctamente',
            'success'
          );
          void this.router.navigate(['/admin/performances']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || 'Error al guardar los datos';
          this.toast.show(errorMsg, 'error');
        }
      });
  }
}
