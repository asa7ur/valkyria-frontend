import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthManager} from '../../../core/services/auth-manager';
import {UserApiService} from '../../../core/services/user-api';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './confirm-email.html'
})
export class ConfirmEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private userApi = inject(UserApiService);
  private auth = inject(AuthManager);

  status = signal<'loading' | 'success' | 'error'>('loading');

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.userApi.confirmEmailChange(token).subscribe({
        next: () => {
          this.auth.logout();
          this.status.set('success');
        },
        error: () => {
          this.status.set('error');
        }
      });
    } else {
      this.status.set('error');
    }
  }
}
