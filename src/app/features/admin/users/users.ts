import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserApiService} from '../../../core/services/user-api';
import {User} from '../../../core/models/user';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [CommonModule, RouterLink],
  templateUrl: './users.html'
})
export class Users implements OnInit {
  private userApi = inject(UserApiService);

  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true); // Empezamos a cargar
    this.userApi.getUsers().subscribe({
      next: (data) => {
        this.users.set(data || []);
        this.isLoading.set(false); // Terminamos de cargar
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.isLoading.set(false); // Terminamos incluso si hay error
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userApi.deleteUser(id).subscribe({
        next: () => {
          this.users.update(prevUsers => prevUsers.filter(u => u.id !== id));
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
