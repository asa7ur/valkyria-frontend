import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserApiService} from '../../../../core/services/user-api';
import {ToastService} from '../../../../core/services/toast';

@Component({
  selector: 'app-user-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit.html'
})
export class UserEdit implements OnInit {
  private fb = inject(FormBuilder);
  private userApi = inject(UserApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  userForm: FormGroup;
  userId: number | null = null;

  constructor() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
      birthDate: ['', [Validators.required]],
      phone: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.userApi.getUserById(id).subscribe({
        next: (user) => {
          const formattedUser = {...user};
          if (user.birthDate) {
            formattedUser.birthDate = user.birthDate.split('T')[0];
          }
          this.userForm.patchValue(formattedUser);
        }
      });
    }
  }

  onSubmit() {
    if (this.userForm.valid && this.userId) {
      this.userApi.updateUser(this.userId, this.userForm.value).subscribe({
        next: () => {
          // Disparamos el toast de éxito
          this.toast.show('Usuario actualizado correctamente', 'success');
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.toast.show('Error al actualizar el usuario', 'error');
          console.error(err);
        }
      });
    }
  }
}
