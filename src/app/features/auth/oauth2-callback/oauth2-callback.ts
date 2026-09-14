import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthManager} from '../../../core/services/auth-manager';

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
    // El backend redirige con un código de un solo uso (el JWT nunca viaja en la URL)
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!code) {
      this.router.navigate(['/login'], {queryParams: {error: 'oauth'}});
      return;
    }

    this.auth.exchangeOAuth2Code(code).subscribe({
      next: (response) => {
        const isAdmin = response.roles.some(r => r.authority === 'ROLE_ADMIN' || r.authority === 'ROLE_MANAGER');
        this.router.navigate([isAdmin ? '/admin/dashboard' : '/'], {replaceUrl: true});
      },
      error: (err) => {
        const error = err.status === 403 ? 'account_disabled' : 'oauth';
        this.router.navigate(['/login'], {queryParams: {error}, replaceUrl: true});
      }
    });
  }
}
