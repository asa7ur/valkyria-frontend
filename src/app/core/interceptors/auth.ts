import {HttpInterceptorFn, HttpErrorResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthManager} from '../services/auth-manager';
import {catchError, throwError} from 'rxjs';
import {Router} from '@angular/router';

export const auth: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthManager);
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401 (Unauthorized), forzamos el logout
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
