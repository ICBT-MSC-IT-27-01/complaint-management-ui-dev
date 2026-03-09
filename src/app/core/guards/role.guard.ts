import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles: string[] = route.data['roles'] ?? [];
  if (!auth.isAuthenticated()) { router.navigate(['/auth/login']); return false; }
  if (roles.length === 0 || auth.hasRole(...roles)) return true;
  router.navigate(['/unauthorized']);
  return false;
};
