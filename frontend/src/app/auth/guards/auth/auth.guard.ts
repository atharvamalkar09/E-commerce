import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../auth.service";
import { map, take } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUserValue;
  
  if (user && !user.isLocked) {

    return true;
  }

  return authService.checkSession().pipe(

    take(1), 
    map(u => {
      if (u && !u.isLocked){ 
        return true;
      }
      
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });

      return false;
    })
  );
};
