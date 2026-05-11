import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthManager} from '../../../core/services/auth-manager';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthManager);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  // Definición del formulario reactivo para el registro de nuevos usuarios
  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    birthDate: ['', [Validators.required]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, {
    // Validador personalizado para asegurar que las contraseñas coinciden
    validators: (group) => {
      const pass = group.get('password')?.value;
      const confirmPass = group.get('confirmPassword')?.value;
      return pass === confirmPass ? null : {notSame: true};
    }
  });

  get passwordValue(): string {
    return this.registerForm.get('password')?.value || '';
  }

  get pwHasMinLength(): boolean { return this.passwordValue.length >= 8; }
  get pwHasUpperCase(): boolean { return /[A-Z]/.test(this.passwordValue); }
  get pwHasLowerCase(): boolean { return /[a-z]/.test(this.passwordValue); }
  get pwHasNumber(): boolean { return /[0-9]/.test(this.passwordValue); }
  get pwHasSpecial(): boolean { return /[@#$%^&+=!]/.test(this.passwordValue); }

  get showPasswordHints(): boolean {
    const ctrl = this.registerForm.get('password');
    return !!(ctrl?.touched && ctrl?.dirty);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const userData = this.registerForm.value as any;

      // Delegamos la lógica de registro al AuthManager
      this.auth.register(userData).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.successMessage.set('register.success.check_email');
          // Redirección al login tras un registro exitoso tras un breve retraso
          setTimeout(() => this.router.navigate(['/login']), 5000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || $localize`:@@register.error.default:Error durante el registro`);
          console.error('Registration error:', err);
        }
      });
    } else {
      // Marcamos todos los campos para mostrar errores visuales
      this.registerForm.markAllAsTouched();
    }
  }
}
