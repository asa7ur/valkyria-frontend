import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthManager} from '../../../core/services/auth-manager';
import {AuthResponse} from '../../../core/models/auth-payments';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  templateUrl: './oauth2-callback.html'
})
export class OAuth2Callback implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthManager);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];
      const firstName = params['firstName'];

      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles: { authority: string }[] = payload.roles ?? [];

        const authResponse: AuthResponse = {token, username: email, firstName, roles};
        this.auth.handleOAuth2Callback(authResponse);

        const isAdmin = roles.some(r => r.authority === 'ROLE_ADMIN' || r.authority === 'ROLE_MANAGER');
        this.router.navigate([isAdmin ? '/admin/dashboard' : '/']);
      } catch {
        this.router.navigate(['/login']);
      }
    });
  }
}
