import {ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SponsorApi} from '../../../../core/services/sponsor-api';
import {StageApi} from '../../../../core/services/stage-api';
import {ToastService} from '../../../../core/services/toast';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Sponsor} from '../../../../core/models/sponsor';
import {Stage} from '../../../../core/models/stage';

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

  sponsor = signal<Sponsor | null>(null);
  allStages = signal<Stage[]>([]);
  sponsorForm!: FormGroup<SponsorForm>;

  isLoading = signal(false);
  isInitialLoading = signal(true);
  isLogoLoading = signal(false);

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
    })
  }

  ngOnInit() {
    this.loadStages();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSponsor(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  loadStages(): void {
    this.stageApi.getStages(0, 1000).subscribe(res => {
      this.allStages.set(res.data);
    })
  }

  loadSponsor(id: string): void {
    this.sponsorApi.getSponsorById(id).subscribe({
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
      }
    });
  }

  onStageToggle(stageId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentIds = this.sponsorForm.controls.stageIds.value;

    if (checkbox.checked) {
      this.sponsorForm.controls.stageIds.setValue([...currentIds, stageId]);
    } else {
      this.sponsorForm.controls.stageIds.setValue(currentIds.filter(id => id !== stageId));
    }
  }

  isStageSelected(stageId: number): boolean {
    return this.sponsorForm.controls.stageIds.value.includes(stageId);
  }

  getImageUrl(fileName: string | undefined): string {
    return `${this.sponsorApi.imagesBaseUrl}/${fileName}`;
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const current = this.sponsor();

    if (file && current) {
      this.isLogoLoading.set(true);
      this.sponsorApi.uploadLogo(current.id, file).subscribe({
        next: () => {
          this.toast.show('Imagen actualizada', 'success');
          this.loadSponsor(current.id.toString());
          this.isLogoLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al subir imagen', 'error');
          this.isLogoLoading.set(false);
        }
      })
    }
  }

  removeLogo(): void {
    const current = this.sponsor();
    if (current?.id) {
      this.sponsorApi.deleteLogo(current.id).subscribe({
        next: () => {
          this.toast.show('Imagen eliminada', 'success');
          this.loadSponsor(current.id.toString());
        }
      })
    }
  }

  onSubmit(): void {
    if (this.sponsorForm.invalid) return;

    this.isLoading.set(true);
    const data = this.sponsorForm.getRawValue();
    const current = this.sponsor();

    const request = current
      ? this.sponsorApi.updateSponsor(current.id, data)
      : this.sponsorApi.createSponsor(data);

    request.subscribe({
      next: () => {
        this.toast.show(current ? 'Patrocinador actualizado' : 'Patrocinador creado', 'success');
        void this.router.navigate(['/admin/sponsors']);
      },
      error: () => this.isLoading.set(false)
    });
  }

}
