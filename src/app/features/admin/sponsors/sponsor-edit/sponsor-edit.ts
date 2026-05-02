import { ChangeDetectorRef, Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SponsorApi } from '../../../../core/services/sponsor-api';
import { StageApi } from '../../../../core/services/stage-api';
import { ToastService } from '../../../../core/services/toast';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Sponsor } from '../../../../core/models/sponsor';
import { Stage } from '../../../../core/models/stage';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface SponsorForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  contribution: FormControl<number>;
  stageIds: FormControl<number[]>;
}

@Component({
  selector: 'app-sponsor-edit',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './sponsor-edit.html',
})
export class SponsorEdit implements OnInit {
  private readonly sponsorApi = inject(SponsorApi);
  private readonly stageApi = inject(StageApi);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected sponsor = signal<Sponsor | null>(null);
  protected allStages = signal<Stage[]>([]);
  protected sponsorForm!: FormGroup<SponsorForm>;

  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isLogoLoading = signal(false);
  protected isEditMode = signal(false);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.sponsorForm = this.fb.group<SponsorForm>({
      name: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(100)]),
      phone: this.fb.control('', [Validators.required, Validators.maxLength(20)]),
      contribution: this.fb.control(0, [Validators.required, Validators.min(0)]),
      stageIds: this.fb.control([])
    });
  }

  ngOnInit() {
    this.loadStages();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadSponsor(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  private loadStages(): void {
    this.stageApi.getStages(0, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.allStages.set(res.data || []);
      });
  }

  private loadSponsor(id: string): void {
    this.sponsorApi.getSponsorById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          this.sponsor.set(data);

          const stageIds = data.stages?.map(s => s.id) || [];

          this.sponsorForm.patchValue({
            name: data.name,
            email: data.email,
            phone: data.phone,
            contribution: data.contribution,
            stageIds: stageIds,
          });

          this.isInitialLoading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.show('Error al cargar patrocinador', 'error');
          this.isInitialLoading.set(false);
          void this.router.navigate(['/admin/sponsors']);
        }
      });
  }

  protected onStageToggle(stageId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentIds = this.sponsorForm.controls.stageIds.value;

    if (checkbox.checked) {
      this.sponsorForm.controls.stageIds.setValue([...currentIds, stageId]);
    } else {
      this.sponsorForm.controls.stageIds.setValue(currentIds.filter(id => id !== stageId));
    }
  }

  protected isStageSelected(stageId: number): boolean {
    return this.sponsorForm.controls.stageIds.value.includes(stageId);
  }

  protected getImageUrl(baseName: string | undefined, suffix: '_thumb.webp' | '_full.webp' = '_thumb.webp'): string {
    return `${this.sponsorApi.imagesBaseUrl}/${baseName}${suffix}`;
  }

  protected onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const current = this.sponsor();

    if (file && current) {
      this.isLogoLoading.set(true);
      this.sponsorApi.uploadLogo(current.id, file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.show('Logo actualizado correctamente', 'success');
            this.loadSponsor(current.id.toString());
            this.isLogoLoading.set(false);
          },
          error: () => {
            this.toast.show('Error al subir el logo', 'error');
            this.isLogoLoading.set(false);
          }
        });
    }
  }

  protected removeLogo(): void {
    const current = this.sponsor();
    if (current?.id) {
      this.sponsorApi.deleteLogo(current.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.show('Logo eliminado correctamente', 'success');
            this.loadSponsor(current.id.toString());
          },
          error: () => this.toast.show('Error al eliminar el logo', 'error')
        });
    }
  }

  protected onSubmit(): void {
    if (this.sponsorForm.invalid) {
      this.sponsorForm.markAllAsTouched();
      this.toast.show('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    this.isLoading.set(true);
    const data = this.sponsorForm.getRawValue();
    const current = this.sponsor();

    const request = current
      ? this.sponsorApi.updateSponsor(current.id, data)
      : this.sponsorApi.createSponsor(data);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show(
            current ? 'Patrocinador actualizado correctamente' : 'Patrocinador creado correctamente', 
            'success'
          );
          void this.router.navigate(['/admin/sponsors']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || 'Error al guardar los datos';
          this.toast.show(errorMsg, 'error');
        }
      });
  }
}
