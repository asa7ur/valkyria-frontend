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
import {ArtistApi} from '../../../../core/services/artist-api';
import {ToastService} from '../../../../core/services/toast';
import {Artist} from '../../../../core/models/artist';

/**
 * Interface para tipado estricto del formulario de artista
 */
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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './artist-edit.html'
})
export class ArtistEdit implements OnInit {
  public readonly artistApi = inject(ArtistApi);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Formularios con tipado estricto
  artist = signal<Artist | null>(null);
  artistForm!: FormGroup<ArtistForm>;

  // Señales para el estado de la UI
  isLoading = signal(false);
  isInitialLoading = signal(true);
  isLogoLoading = signal(false);
  isGalleryLoading = signal(false);

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
      this.loadArtist(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  loadArtist(id: string): void {
    this.artistApi.getArtistById(id).subscribe({
      next: (data) => {
        this.artist.set(data);
        this.artistForm.patchValue(data);

        this.isInitialLoading.set(false);
        // Forzamos detección para evitar el error NG0100 si el componente renderiza rápido
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show('Error al cargar el artista', 'error');
        this.isInitialLoading.set(false);
      }
    });
  }

  getImageUrl(baseName: string | undefined, suffix: '_thumb.webp' | '_full.webp' = '_thumb.webp'): string {
    return `${this.artistApi.imagesBaseUrl}/${baseName}${suffix}`;
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const currentArtist = this.artist();

    if (file && currentArtist) {
      this.isLogoLoading.set(true);
      this.artistApi.uploadLogo(currentArtist.id, file).subscribe({
        next: () => {
          this.toast.show('Logo actualizado correctamente', 'success');
          this.loadArtist(currentArtist.id.toString());
          this.isLogoLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al subir el logo', 'error');
          this.isLogoLoading.set(false);
        }
      });
    }
  }

  onGalleryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const currentArtist = this.artist();

    if (files.length > 0 && currentArtist) {
      this.isGalleryLoading.set(true);
      this.artistApi.uploadImages(currentArtist.id, files).subscribe({
        next: () => {
          this.toast.show('Imágenes añadidas a la galería', 'success');
          this.loadArtist(currentArtist.id.toString());
          this.isGalleryLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al subir imágenes', 'error');
          this.isGalleryLoading.set(false);
        }
      });
    }
  }

  removeLogo(): void {
    const currentArtist = this.artist();
    if (currentArtist?.logo) {
      this.artistApi.deleteLogo(currentArtist.id).subscribe({
        next: () => {
          this.toast.show('Logo eliminado correctamente', 'success');
          this.loadArtist(currentArtist.id.toString());
        },
        error: () => this.toast.show('Error al eliminar el logo', 'error')
      });
    }
  }

  removeImage(imageId: number): void {
    const currentArtist = this.artist();
    if (currentArtist) {
      this.artistApi.deleteImage(imageId).subscribe({
        next: () => {
          this.toast.show('Imagen eliminada', 'success');
          this.loadArtist(currentArtist.id.toString());
        }
      });
    }
  }

  onSubmit(): void {
    const currentArtist = this.artist();
    if (this.artistForm.valid && currentArtist) {
      this.isLoading.set(true);
      this.artistApi.updateArtist(currentArtist.id, this.artistForm.getRawValue()).subscribe({
        next: () => {
          this.toast.show('Datos del artista actualizados', 'success');
          void this.router.navigate(['/admin/artists']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.show('Error al actualizar datos', 'error');
        }
      });
    }
  }
}
