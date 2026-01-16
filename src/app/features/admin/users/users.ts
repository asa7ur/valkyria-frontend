import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserApiService} from '../../../core/services/user-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {User} from '../../../core/models/user';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [CommonModule, RouterLink],
  templateUrl: './users.html'
})
export class UsersAdmin implements OnInit {
  private userApi = inject(UserApiService);
  private confirmService = inject(ConfirmDialogService);

  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);

  // Señales para paginación y búsqueda
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userApi.getUsers(this.currentPage(), 10, this.searchTerm()).subscribe({
      next: (response) => {
        this.users.set(response.content || []);
        this.totalPages.set(response.page.totalPages || 0);
        this.totalElements.set(response.page.totalElements || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.isLoading.set(false);
        this.users.set([]);
      }
    });
  }

  async deleteUser(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Usuario',
      message: '¿Estás completamente seguro? Esta acción no se puede deshacer.',
      btnOkText: 'Sí, eliminar',
      btnCancelText: 'No, cancelar'
    });

    if (confirmed) {
      this.userApi.deleteUser(id).subscribe({
        next: () => {
          this.users.update(prevUsers => prevUsers.filter(u => u.id !== id));
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(0); // Reiniciar a la primera página
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }
}
