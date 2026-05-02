import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserApiService } from '../../../core/services/user-api';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog';
import { User } from '../../../core/models/user';
import { FilterDTO } from '../../../core/models/filter-dto';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true, // Asegúrate de que sea standalone si tu proyecto sigue este patrón
  imports: [CommonModule, RouterLink],
  templateUrl: './users.html'
})
export class UsersAdmin implements OnInit {
  private userApi = inject(UserApiService);
  private confirmService = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals de estado
  protected users = signal<User[]>([]);
  protected isLoading = signal<boolean>(false);
  protected filter = signal<FilterDTO>({
    page: 0,
    itemsPerPage: 10,
    search: '',
    totalPages: 0,
    totalElements: 0
  });

  // Para el debounce de búsqueda
  private searchSubject = new Subject<string>();

  constructor() {
    // Escuchamos los cambios de búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(searchTerm => {
      this.filter.update(f => ({ ...f, search: searchTerm, page: 0 }));
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    const { page, itemsPerPage, search } = this.filter();

    this.userApi.getUsers(page, itemsPerPage, search)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Seguridad ante destrucción
      .subscribe({
        next: (response) => {
          this.users.set(response.data || []);
          this.filter.update(f => ({
            ...f,
            totalPages: response.filter?.totalPages || 0,
            totalElements: response.filter?.totalElements || 0
          }));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.isLoading.set(false);
          this.users.set([]);
        }
      });
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value); // Enviamos al Subject con debounce
  }

  protected goToPage(page: number): void {
    const f = this.filter();
    if (page >= 0 && page < (f.totalPages || 0)) {
      this.filter.update(prev => ({ ...prev, page }));
      this.loadUsers();
    }
  }

  async deleteUser(id: number): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Eliminar Usuario',
      message: '¿Estás seguro?',
      btnOkText: 'Eliminar',
      btnCancelText: 'Cancelar'
    });

    if (!confirmed) return;

    this.userApi.deleteUser(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Usuario eliminado correctamente', 'success');
          this.loadUsers();
        },
        error: () => this.toast.show('Error al eliminar', 'error')
      });
  }
}
