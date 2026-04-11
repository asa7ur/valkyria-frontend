import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserApiService} from '../../../core/services/user-api';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';
import {User} from '../../../core/models/user';
import {RouterLink} from '@angular/router';
import {FilterDTO} from '../../../core/models/filter-dto';

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

  filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    const f = this.filter();

    this.userApi.getUsers(f.page, f.itemsPerPage, f.search).subscribe({
      next: (response) => {
        this.users.set(response.data || []);

        this.filter.update(f => ({
          ...f,
          totalPages: response.filter?.totalPages || 0,
          totalElements: response.filter?.totalElements || 0
        }))

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.isLoading.set(false);
        this.users.set([]);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.filter.update(f => ({
      ...f,
      search: input.value,
      page: 0
    }))

    this.loadUsers();
  }

  goToPage(page: number): void {
    const f = this.filter();

    if (f.totalPages && page >= 0 && page < f.totalPages) {
      this.filter.update(f => ({...f, page}))
      this.loadUsers();
    }
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
          this.loadUsers()
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
