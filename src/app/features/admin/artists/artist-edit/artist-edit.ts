import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ArtistApi} from '../../../../core/services/artist-api';
import {ToastService} from '../../../../core/services/toast';
import {Artist} from '../../../../core/models/artist';

@Component({
  selector: 'app-artist-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './artist-edit.html'
})
export class ArtistEdit implements OnInit {
  public artistApi = inject(ArtistApi);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  artist = signal<Artist | null>(null);
  artistForm: FormGroup;
  isLoading = signal(false);

  constructor() {
    this.artistForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      genre: ['', [Validators.required, Validators.maxLength(100)]],
      country: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      officialUrl: [''],
      instagramUrl: [''],
      tiktokUrl: [''],
      youtubeUrl: [''],
      tidalUrl: [''],
      spotifyUrl: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadArtist(id);
  }

  loadArtist(id: string) {
    this.artistApi.getArtistById(id).subscribe({
      next: (data) => {
        this.artist.set(data);
        this.artistForm.patchValue(data);
      },
      error: () => this.toast.show('Error al cargar el artista', 'error')
    });
  }

  getImageUrl(baseName: string | undefined, suffix: '_thumb.webp' | '_full.webp' = '_thumb.webp'): string {
    return `${this.artistApi.imagesBaseUrl}/${baseName}${suffix}`;
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file && this.artist()) {
      this.artistApi.uploadLogo(this.artist()!.id, file).subscribe({
        next: () => {
          this.toast.show('Logo actualizado correctamente', 'success');
          this.loadArtist(this.artist()!.id.toString());
        },
        error: () => this.toast.show('Error al subir el logo', 'error')
      });
    }
  }

  onGalleryChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length > 0 && this.artist()) {
      this.artistApi.uploadImages(this.artist()!.id, files).subscribe({
        next: () => {
          this.toast.show('Imágenes añadidas a la galería', 'success');
          this.loadArtist(this.artist()!.id.toString());
        },
        error: () => this.toast.show('Error al subir imágenes', 'error')
      });
    }
  }

  removeImage(imageId: number) {
    this.artistApi.deleteImage(imageId).subscribe({
      next: () => {
        this.toast.show('Imagen eliminada', 'success');
        this.loadArtist(this.artist()!.id.toString());
      }
    });
  }

  onSubmit() {
    if (this.artistForm.valid && this.artist()) {
      this.isLoading.set(true);
      this.artistApi.updateArtist(this.artist()!.id, this.artistForm.value).subscribe({
        next: () => {
          this.toast.show('Datos del artista actualizados', 'success');
          this.router.navigate(['/admin/artists']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.show('Error al actualizar datos', 'error');
        }
      });
    }
  }
}
