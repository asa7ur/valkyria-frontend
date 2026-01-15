import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthManager} from '../services/auth-manager';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthManager);
  const router = inject(Router);
  const user = auth.currentUser();

  // Verificamos si es administrador
  const isAdmin = user?.roles.some(r => r.authority === 'ROLE_ADMIN');

  if (isAdmin) {
    return true;
  }

  // Si es Manager (pero no Admin), lo mandamos al dashboard de admin
  if (user?.roles.some(r => r.authority === 'ROLE_MANAGER')) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  // Si no tiene ninguno de los dos, a la web pública
  return router.createUrlTree(['/']);
};
