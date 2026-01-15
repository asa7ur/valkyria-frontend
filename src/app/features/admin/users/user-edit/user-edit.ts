import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserApiService} from '../../../../core/services/user-api';
import {UserRegistrationDTO} from '../../../../core/models/user';

@Component({
  selector: 'app-user-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit.html'
})
export class UserEdit implements OnInit {
  private fb = inject(FormBuilder);
  private userApi = inject(UserApiService);
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
      const formValue = this.userForm.value;
      const dto = {
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        birthDate: formValue.birthDate,
        phone: formValue.phone,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword
      };

      this.userApi.updateUser(this.userId, dto).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          console.error('Error al actualizar:', err);
          // Aquí podrás ver qué campo exacto falló en la consola
        }
      });
    }
  }
}
