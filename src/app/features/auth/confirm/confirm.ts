import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {AuthManager} from '../../../core/services/auth-manager';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirm.html'
})
export class Confirm implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthManager);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal<string>($localize`:@@confirm.msg.loading:Verificando tu estado de guerrero...`);

  ngOnInit() {
    // Extraemos el token de los parámetros de la URL (?token=...)
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      // Delegamos la confirmación de cuenta al AuthManager
      this.auth.confirmAccount(token).subscribe({
        next: () => {
          this.status.set('success');
          this.message.set($localize`:@@confirm.msg.success:Tu cuenta ha sido activada. ¡Bienvenido a la Horda!`);
        },
        error: (err) => {
          this.status.set('error');
          this.message.set(err.error?.error || $localize`:@@confirm.msg.error.invalid:El enlace de activación no es válido o ha expirado.`);
        }
      });
    } else {
      this.status.set('error');
      this.message.set($localize`:@@confirm.msg.error.noToken:No se encontró ningún token de activación.`);
    }
  }
}
