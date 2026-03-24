import {ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {PerformanceApi} from '../../../../core/services/performance-api';
import {ArtistApi} from '../../../../core/services/artist-api';
import {StageApi} from '../../../../core/services/stage-api';
import {ToastService} from '../../../../core/services/toast';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Performance as PerformanceModel} from '../../../../core/models/performance';
import {Artist} from '../../../../core/models/artist';
import {Stage} from '../../../../core/models/stage';

/**
 * Interface para tipado estricto del formulario de actuación
 */
interface PerformanceForm {
  artistId: FormControl<number | null>;
  stageId: FormControl<number | null>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
}

@Component({
  selector: 'app-performance-edit',
  imports: [
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

  performance = signal<PerformanceModel | null>(null);
  artists = signal<Artist[]>([]);
  stages = signal<Stage[]>([]);

  performanceForm!: FormGroup<PerformanceForm>;
  isLoading = signal(false);
  isInitialLoading = signal(true);

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
    this.loadDependencies();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPerformance(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  private loadDependencies(): void {
    this.artistApi.getArtists(0, 100).subscribe(res => this.artists.set(res.data));
    this.stageApi.getStages(0, 100).subscribe(res => this.stages.set(res.content));
  }

  loadPerformance(id: string): void {
    this.performanceApi.getPerformanceById(id).subscribe({
      next: (response) => {
        const data = response.data;
        this.performance.set(data);
        this.performanceForm.patchValue(data);

        this.isInitialLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show('Error al cargar la actuación', 'error');
        this.isInitialLoading.set(false);
      }
    })
  }

  onSubmit(): void {
    if (this.performanceForm.invalid) {
      this.toast.show('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    this.isLoading.set(true);
    const currentPerformance = this.performance();
    const formData = this.performanceForm.getRawValue();

    if (currentPerformance && currentPerformance.id) {
      this.performanceApi.updatePerformance(currentPerformance.id, formData).subscribe({
        next: () => {
          this.toast.show('Actuación actualizada', 'success');
          void this.router.navigate(['/admin/performances']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.show('Error al actualizar los datos', 'error');
        }
      });
    } else {
      this.performanceApi.createPerformance(formData).subscribe({
        next: () => {
          this.toast.show('Actuación creada', 'success');
          void this.router.navigate(['/admin/performances']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.show('Error al guardar los datos', 'error');
        }
      });
    }
  }
}
