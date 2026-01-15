import {inject} from '@angular/core';
import {Router, CanActivateFn} from '@angular/router';
import {AuthManager} from '../services/auth-manager';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthManager);
  const router = inject(Router);
  const user = auth.currentUser(); // Obtenemos el usuario del signal

  // Verificamos si tiene alguno de los roles permitidos
  const hasAccess = user?.roles.some(r =>
    r.authority === 'ROLE_ADMIN' || r.authority === 'ROLE_MANAGER'
  ) ?? false;

  if (!hasAccess) {
    // Si no tiene acceso, redirigimos a la raíz
    return router.createUrlTree(['/']);
  }

  return true;
};
