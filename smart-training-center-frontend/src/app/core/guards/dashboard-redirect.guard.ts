import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dashboardRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('ADMINISTRATEUR')) {
    return router.createUrlTree(['/dashboard/administratif']);
  } else if (authService.hasRole('RESPONSABLE_ACADEMIQUE')) {
    return router.createUrlTree(['/dashboard/decisionnel']);
  } else {
    return router.createUrlTree(['/dashboard/pedagogique']);
  }
};
