import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthManager} from '../../../core/services/auth-manager';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthManager);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials = this.loginForm.value as any;

      this.auth.login(this.loginForm.value as any).subscribe({
        next: (response) => {
          // Extraemos los nombres de los roles del array de objetos
          const roles = response.roles.map(r => r.authority);

          const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER');

          if (isAdmin) {
            // REDIRECCIÓN EXTERNA: Forzamos al navegador a ir al servidor de Thymeleaf
            // La cookie 'jwt' ya se habrá guardado gracias a allowCredentials: true
            window.location.href = 'http://localhost:4200/admin/dashboard';
          } else {
            // REDIRECCIÓN INTERNA: Seguimos dentro de la aplicación Angular
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set($localize`:@@login.error.invalidCredentials:Credenciales incorrectas o error de conexión`);
          console.error('Login error:', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
