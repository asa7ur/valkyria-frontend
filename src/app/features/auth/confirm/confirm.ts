import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirm',
  imports: [RouterLink],
  templateUrl: './confirm.html'
})
export class Confirm implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal<string>('Verifying your warrior status...');

  ngOnInit() {
    // Extraemos el token de los parámetros de la URL (?token=...)
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.authService.confirmAccount(token).subscribe({
        next: () => {
          this.status.set('success');
          this.message.set('Your account has been activated. Welcome to the Horde!');
        },
        error: (err) => {
          this.status.set('error');
          this.message.set(err.error?.error || 'The activation link is invalid or has expired.');
        }
      });
    } else {
      this.status.set('error');
      this.message.set('No activation token found.');
    }
  }
}
