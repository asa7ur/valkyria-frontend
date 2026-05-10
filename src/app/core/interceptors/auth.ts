import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {AuthManager} from '../services/auth-manager';

export const auth: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  const router = inject(Router);
  const authManager = inject(AuthManager);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.warn('Sesión inválida o caducada. Redirigiendo a login...');
        authManager.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  )
};
