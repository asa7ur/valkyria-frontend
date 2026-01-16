import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArtistApi} from '../../../core/services/artist-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {Artist} from '../../../core/models/artist';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-artists',
  imports: [CommonModule, RouterLink],
  templateUrl: './artists.html'
})
export class ArtistsAdmin implements OnInit {
  private artistApi = inject(ArtistApi);
  private confirmService = inject(ConfirmDialogService);

  artists = signal<Artist[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.artistApi.getArtists().subscribe({
      next: (data) => {
        this.artists.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar artista: ', err);
        this.isLoading.set(false);
      }
    })
  }

  async deleteArtist(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Artista',
      message: '¿Estás completamente seguro? Esta acción no se puede deshacer.',
      btnOkText: 'Sí, eliminar',
      btnCancelText: 'No, cancelar'
    });

    if (confirmed) {
      this.artistApi.deleteArtist(id).subscribe({
        next: () => {
          this.artists.update(prevArtists => prevArtists.filter(a => a.id !== id));
        },
        error: (err) => console.error('Error al eliminar: ', err)
      });
    }
  }
}
