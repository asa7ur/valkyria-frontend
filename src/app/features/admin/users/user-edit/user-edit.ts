import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { UserApiService } from '../../../../core/services/user-api';
import { ToastService } from '../../../../core/services/toast';
import { User } from '../../../../core/models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly destroyRef = inject(DestroyRef);

  // Señales para el estado y los datos
  protected user = signal<User | null>(null);
  protected userForm!: FormGroup<UserForm>;
  protected passwordForm!: FormGroup<PasswordForm>;

  protected isLoading = signal(false);
  protected isInitialLoading = signal(true);
  protected isEditMode = signal(false);

  protected availableRoles = ['USER', 'MANAGER', 'ADMIN'];

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
    }, { validators: this.passwordMatchValidator });
  }

  protected get rolesArray() {
    return this.userForm.controls.roles;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadUser(id);
    } else {
      this.isInitialLoading.set(false);
    }
  }

  private loadUser(id: string) {
    this.userApi.getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data;
          this.user.set(data);

          // Formateo de fecha para el input type="date"
          const formattedDate = data.birthDate ? data.birthDate.split('T')[0] : '';

          // Mapeamos los roles para el FormArray (esto genera un boolean[])
          const rolesValues = this.availableRoles.map(role => data.roles?.includes(role) || false);

          // Extraer 'roles'
          // Usamos desestructuración para crear un objeto 'rest' que no contenga 'roles'
          const { roles, ...rest } = data;

          // Parchear el formulario base
          this.userForm.patchValue({
            ...rest,
            birthDate: formattedDate
          });

          // Actualizamos los valores del FormArray
          this.rolesArray.patchValue(rolesValues);

          this.isInitialLoading.set(false);
        },
        error: () => {
          this.toast.show('Error al cargar el usuario', 'error');
          this.isInitialLoading.set(false);
          void this.router.navigate(['/admin/users']);
        }
      });
  }

  // Validador personalizado para la contraseña
  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  };

  protected onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.show('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const currentUser = this.user();
    if (!currentUser) return;

    this.isLoading.set(true);

    // Obtenemos los nombres de los roles seleccionados
    const selectedRoles = this.rolesArray.value
      .map((checked, i) => checked ? this.availableRoles[i] : null)
      .filter((role): role is string => role !== null);

    const payload = {
      ...this.userForm.getRawValue(),
      roles: selectedRoles
    };

    this.userApi.updateUser(currentUser.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Usuario actualizado correctamente', 'success');
          void this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || 'Error al actualizar';
          this.toast.show(errorMsg, 'error');
        }
      });
  }

  protected onChangePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toast.show('Por favor verifica los datos ingresados', 'error');
      return;
    }

    const currentUser = this.user();
    if (!currentUser) return;

    this.userApi.changePassword(currentUser.id, this.passwordForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Contraseña actualizada correctamente', 'success');
          this.passwordForm.reset();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Error al actualizar contraseña';
          this.toast.show(errorMsg, 'error');
        }
      });
  }
}
