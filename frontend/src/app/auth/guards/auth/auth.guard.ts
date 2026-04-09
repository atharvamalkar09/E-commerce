import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../auth.service";
import { map, take } from "rxjs";




export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // We call checkSession() on every route change to verify 
  // the session hasn't been deleted by an Admin
  return authService.checkSession().pipe(
    // take(1),
    map(user => {
      if (user && !user.isLocked) {
        return true;
      } else {
        // If user is null (session deleted) or locked, redirect to login
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};