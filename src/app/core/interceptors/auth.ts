import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {AuthManager} from '../services/auth-manager';

export const auth: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const injector = inject(Injector); // Usamos Injector para evitar dependencia circular

  const token = localStorage.getItem('auth_token');

  // El backend traduce sus mensajes según este idioma
  const headers: Record<string, string> = {'Accept-Language': localStorage.getItem('lang') || 'es'};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const authReq = req.clone({setHeaders: headers});

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Obtenemos AuthManager solo cuando ocurre un error
      const authManager = injector.get(AuthManager);

      // 401 = sesión inválida o caducada. Un 403 es falta de permisos y no debe cerrar la sesión.
      if (error.status === 401) {
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
