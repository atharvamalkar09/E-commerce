import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { map, take } from 'rxjs/operators';
import { AuthService } from '../../auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      // Check if user exists AND has the admin role
      if (user && user.role === 'admin') {
        return true;
      }
      
      // If not an admin, redirect to home or access-denied page
      router.navigate(['/']); 
      return false;
    })
  );
};
