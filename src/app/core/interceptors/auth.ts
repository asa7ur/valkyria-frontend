import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {AuthManager} from '../services/auth-manager';

export const auth: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const injector = inject(Injector); // Usamos Injector para evitar dependencia circular

  const token = localStorage.getItem('auth_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Obtenemos AuthManager solo cuando ocurre un error
      const authManager = injector.get(AuthManager);

      if (error.status === 401 || error.status === 403) {
        console.warn('Sesión inválida o caducada. Redirigiendo a login...');

        // Solo redirigir si no estamos ya en la página de login
        if (!router.url.includes('/login')) {
          authManager.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
