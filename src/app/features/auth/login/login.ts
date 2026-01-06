import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Señales para manejar el estado de la interfaz
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  // Definición del formulario reactivo
  // Asegúrate de que en el HTML uses formControlName="username"
  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials = this.loginForm.value as any;

      this.authService.login(credentials).subscribe({
        next: () => {
          // Redirección al inicio tras un login exitoso
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Credenciales incorrectas o error de conexión');
          console.error('Login error:', err);
        }
      });
    } else {
      // Si el formulario no es válido, marcamos los campos para mostrar errores
      this.loginForm.markAllAsTouched();
    }
  }
}
