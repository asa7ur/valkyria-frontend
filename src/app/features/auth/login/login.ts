import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthManager} from '../../../core/services/auth-manager';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: '../auth-panel.css'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthManager);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage = signal<string | null>(null);
  // Errores que llegan en la URL tras el login con Google (se traducen en la plantilla)
  errorKey = signal<string | null>(null);
  infoMessage = signal<string | null>(null);
  // Cuenta sin activar: se ofrece reenviar el email de activación
  canResendActivation = signal<boolean>(false);
  isResending = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  private googleAuthUrl = `${environment.apiUrl}/oauth2/authorization/google`;

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit() {
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error === 'account_disabled' || error === 'oauth') {
      this.errorKey.set(`login.errors.${error}`);
    }
  }

  loginWithGoogle() {
    window.location.href = this.googleAuthUrl;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      this.auth.login(this.loginForm.value as any).subscribe({
        next: (response) => {
          // Extraemos los nombres de los roles del array de objetos
          const roles = response.roles.map(r => r.authority);

          const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER');

          if (isAdmin) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message
            || $localize`:@@login.error.invalidCredentials:Credenciales incorrectas o error de conexión`);
          // 403 = contraseña correcta pero cuenta no activa
          this.canResendActivation.set(err.status === 403);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  resendActivation() {
    const email = this.loginForm.value.username;
    if (!email) return;

    this.isResending.set(true);
    this.auth.resendActivation(email).subscribe({
      next: (res) => {
        this.isResending.set(false);
        this.clearMessages();
        this.infoMessage.set(res.message);
      },
      error: (err) => {
        this.isResending.set(false);
        this.errorMessage.set(err.error?.message
          || $localize`:@@login.error.resend:No se pudo reenviar el email de activación`);
      }
    });
  }

  private clearMessages() {
    this.errorMessage.set(null);
    this.errorKey.set(null);
    this.infoMessage.set(null);
    this.canResendActivation.set(false);
  }
}
