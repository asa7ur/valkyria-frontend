import {Component, OnInit, inject} from '@angular/core';
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
  users: User[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userApi.getUsers().subscribe(data => this.users = data);
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userApi.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.id !== id);
      });
    }
  }
}
