import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray} from '@angular/forms';
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
  passwordForm: FormGroup;
  userId: number | null = null;

  // Lista de roles disponibles en el sistema
  availableRoles = ['USER', 'MANAGER', 'ADMIN'];

  constructor() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]], // Email ahora es editable
      phone: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      enabled: [true], // Campo para el estado
      roles: this.fb.array([]) // Campo para roles (FormArray)
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {validators: this.passwordMatchValidator});
  }

  get rolesArray() {
    return this.userForm.get('roles') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.userApi.getUserById(this.userId).subscribe({
        next: (user) => {
          const formattedUser = {...user};
          if (user.birthDate) {
            formattedUser.birthDate = user.birthDate.split('T')[0];
          }

          // Limpiar roles actuales y rellenar según el usuario
          this.rolesArray.clear();
          this.availableRoles.forEach(role => {
            const isSelected = user.roles?.includes(role) || false;
            this.rolesArray.push(this.fb.control(isSelected));
          });

          this.userForm.patchValue(formattedUser);
        },
        error: () => this.toast.show('Error al cargar el usuario', 'error')
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }

  onUpdateProfile() {
    if (this.userForm.valid && this.userId) {
      // Mapeamos los booleanos del FormArray de vuelta a strings de roles
      const selectedRoleNames = this.userForm.value.roles
        .map((checked: boolean, i: number) => checked ? this.availableRoles[i] : null)
        .filter((v: any) => v !== null);

      const payload = {
        ...this.userForm.value,
        roles: selectedRoleNames
      };

      this.userApi.updateUser(this.userId, payload).subscribe({
        next: () => {
          this.toast.show('Usuario actualizado correctamente', 'success');
        },
        error: (err) => {
          this.toast.show(err.error?.message || 'Error al actualizar', 'error');
        }
      });
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid && this.userId) {
      this.userApi.changePassword(this.userId, this.passwordForm.value).subscribe({
        next: () => {
          this.toast.show('Contraseña actualizada', 'success');
          this.passwordForm.reset();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error', 'error')
      });
    }
  }
}
