import {Component, OnInit, inject, signal, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ArtistApi} from '../../../../core/services/artist-api';
import {ToastService} from '../../../../core/services/toast';
import {Artist} from '../../../../core/models/artist';

interface ArtistForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  genre: FormControl<string>;
  country: FormControl<string>;
  description: FormControl<string>;
  officialUrl: FormControl<string>;
  instagramUrl: FormControl<string>;
  tiktokUrl: FormControl<string>;
  youtubeUrl: FormControl<string>;
  tidalUrl: FormControl<string>;
  spotifyUrl: FormControl<string>;
}

@Component({
  selector: 'app-artist-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './artist-edit.html'
})
export class ArtistEdit implements OnInit {
  private readonly artistApi = inject(ArtistApi);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly imagesBaseUrl = this.artistApi.imagesBaseUrl;

  protected artist = signal<Artist | null>(null);
  protected artistForm!: FormGroup<ArtistForm>;

  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isLogoLoading = signal(false);
  protected isGalleryLoading = signal(false);
  protected isEditMode = signal(false);

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.artistForm = this.fb.group<ArtistForm>({
      name: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(100)]),
      phone: this.fb.control('', [Validators.required, Validators.maxLength(20)]),
      genre: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      country: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      description: this.fb.control(''),
      officialUrl: this.fb.control(''),
      instagramUrl: this.fb.control(''),
      tiktokUrl: this.fb.control(''),
      youtubeUrl: this.fb.control(''),
      tidalUrl: this.fb.control(''),
      spotifyUrl: this.fb.control('')
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.loadArtist(id);
    } else {
      this.isEditMode.set(false);
      this.isInitialLoading.set(false);
    }
  }

  private loadArtist(id: string): void {
    this.artistApi.getArtistById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data;
          this.artist.set(data);
          this.artistForm.patchValue(data);
          this.isInitialLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al cargar el artista', 'error');
          this.isInitialLoading.set(false);
        }
      });
  }

  // Recarga el artista desde el servidor (tras operaciones de imagen)
  private refreshArtist(): void {
    const currentArtist = this.artist();
    if (currentArtist) {
      this.loadArtist(currentArtist.id.toString());
    }
  }

  protected getImageUrl(
    baseName: string | undefined,
    suffix: '_thumb.webp' | '_full.webp' = '_thumb.webp'
  ): string {
    return `${this.imagesBaseUrl}/${baseName}${suffix}`;
  }

  protected onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const currentArtist = this.artist();

    if (!file || !currentArtist) return;

    this.isLogoLoading.set(true);
    this.artistApi.uploadLogo(currentArtist.id, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Logo actualizado correctamente', 'success');
          this.refreshArtist();
          this.isLogoLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al subir el logo', 'error');
          this.isLogoLoading.set(false);
        }
      });
  }

  protected onGalleryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const currentArtist = this.artist();

    if (files.length === 0 || !currentArtist) return;

    this.isGalleryLoading.set(true);
    this.artistApi.uploadImages(currentArtist.id, files)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Imágenes añadidas a la galería', 'success');
          this.refreshArtist();
          this.isGalleryLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al subir imágenes', 'error');
          this.isGalleryLoading.set(false);
        }
      });
  }

  protected removeLogo(): void {
    const currentArtist = this.artist();
    if (!currentArtist?.logo) return;

    this.artistApi.deleteLogo(currentArtist.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Logo eliminado correctamente', 'success');
          this.refreshArtist();
        },
        error: () => this.toast.show('Error al eliminar el logo', 'error')
      });
  }

  protected removeImage(imageId: number): void {
    const currentArtist = this.artist();
    if (!currentArtist) return;

    this.artistApi.deleteImage(imageId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Imagen eliminada', 'success');
          this.refreshArtist();
        },
        error: () => this.toast.show('Error al eliminar la imagen', 'error')
      });
  }

  protected onSubmit(): void {
    if (this.artistForm.invalid) {
      this.artistForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formData = this.artistForm.getRawValue();

    // FIX: lógica de edición vs creación correctamente separada
    if (this.isEditMode()) {
      const currentArtist = this.artist();
      if (!currentArtist) return;

      this.artistApi.updateArtist(currentArtist.id, formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.show('Datos del artista actualizados', 'success');
            void this.router.navigate(['/admin/artists']);
          },
          error: () => {
            this.isLoading.set(false);
            this.toast.show('Error al actualizar datos', 'error');
          }
        });
    } else {
      this.artistApi.createArtist(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.show('Artista creado correctamente', 'success');
            void this.router.navigate(['/admin/artists']);
          },
          error: () => {
            this.isLoading.set(false);
            this.toast.show('Error al crear el artista', 'error');
          }
        });
    }
  }
}
