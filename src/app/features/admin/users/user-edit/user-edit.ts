import {Component, OnInit, inject, signal, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormControl,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import {UserApiService} from '../../../../core/services/user-api';
import {ToastService} from '../../../../core/services/toast';

/**
 * Interface para tipado estricto del formulario de usuario
 */
interface UserForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  birthDate: FormControl<string>;
  enabled: FormControl<boolean>;
  roles: FormArray<FormControl<boolean>>;
}

interface PasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit.html'
})
export class UserEdit implements OnInit {
  private readonly userApi = inject(UserApiService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Señales para el estado de la UI
  isLoading = signal(false);
  isInitialLoading = signal(true);

  userId: number | null = null;
  availableRoles = ['USER', 'MANAGER', 'ADMIN'];

  // Formularios con tipado estricto
  userForm!: FormGroup<UserForm>;
  passwordForm!: FormGroup<PasswordForm>;

  constructor() {
    this.initForm();
  }

  private initForm() {
    const rolesControls = this.availableRoles.map(() => this.fb.control(false));

    this.userForm = this.fb.group<UserForm>({
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      phone: this.fb.control('', [Validators.required]),
      birthDate: this.fb.control('', [Validators.required]),
      enabled: this.fb.control(true),
      roles: this.fb.array(rolesControls)
    });

    this.passwordForm = this.fb.group<PasswordForm>({
      currentPassword: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.control('', [Validators.required])
    }, {validators: this.passwordMatchValidator});
  }

  get rolesArray() {
    return this.userForm.controls.roles;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.loadUserData();
    } else {
      this.isInitialLoading.set(false);
    }
  }

  private loadUserData() {
    if (!this.userId) return;

    this.userApi.getUserById(this.userId).subscribe({
      next: (user) => {
        // Formateo de fecha para el input type="date"
        const formattedDate = user.birthDate ? user.birthDate.split('T')[0] : '';

        // Mapeamos los roles del usuario al FormArray
        const rolesValues = this.availableRoles.map(role => user.roles?.includes(role) || false);

        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          birthDate: formattedDate,
          enabled: user.enabled
        });

        // Actualizamos los valores del FormArray
        this.rolesArray.patchValue(rolesValues);

        this.isInitialLoading.set(false);

        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show('Error al cargar el usuario', 'error');
        this.isInitialLoading.set(false);
      }
    });
  }

  // Validador personalizado para la contraseña
  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : {mismatch: true};
  };

  onUpdateProfile() {
    if (this.userForm.valid && this.userId) {
      this.isLoading.set(true);

      // Obtenemos los nombres de los roles seleccionados
      const selectedRoles = this.rolesArray.value
        .map((checked, i) => checked ? this.availableRoles[i] : null)
        .filter((role): role is string => role !== null);

      const payload = {
        ...this.userForm.getRawValue(),
        roles: selectedRoles
      };

      this.userApi.updateUser(this.userId, payload).subscribe({
        next: () => {
          this.toast.show('Usuario actualizado correctamente', 'success');
          void this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toast.show(err.error?.message || 'Error al actualizar', 'error');
        }
      });
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid && this.userId) {
      this.userApi.changePassword(this.userId, this.passwordForm.getRawValue()).subscribe({
        next: () => {
          this.toast.show('Contraseña actualizada', 'success');
          this.passwordForm.reset();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error', 'error')
      });
    }
  }
}
