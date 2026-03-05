import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isLoggingOut = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/') && !isLoggingOut) {
        isLoggingOut = true;
        authService.logout();
        // Reset flag after a short delay to allow future login attempts
        setTimeout(() => isLoggingOut = false, 1000);
      }

      if (error.status === 403) {
        router.navigate(['/']);
      }

      const errorMessage = error.error?.message || error.message || 'Une erreur est survenue';
      return throwError(() => ({ status: error.status, message: errorMessage }));
    })
  );
};
