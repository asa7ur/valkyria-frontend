import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthManager} from '../services/auth-manager';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthManager); // Variable más corta y descriptiva
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
