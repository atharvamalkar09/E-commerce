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

  // Use take(1) to ensure the guard completes after one value
  return authService.checkSession().pipe(
    take(1), 
    map(u => {
      if (u && !u.isLocked) return true;
      
      // Navigate to login and save the URL they were TRYING to go to
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};








// import { inject } from "@angular/core";
// import { CanActivateFn, Router } from "@angular/router";
// import { AuthService } from "../../auth.service";
// import { map } from "rxjs";

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Check the service variable directly if possible, or use take(1)
//   const user = authService.currentUserValue; // Create this helper in your service
  
//   if (user && !user.isLocked) {
//     return true;
//   } else {
//     // If we aren't sure, we MUST check the session but return an Observable
//     return authService.checkSession().pipe(
//       map(u => {
//         if (u) return true;
//         router.navigate(['/auth/login']);
//         return false;
//       })
//     );
//   }
// };








// import { CanActivateFn, Router } from "@angular/router";
// import { AuthService } from "../../auth.service";
// import { inject } from "@angular/core";
// import { map, take } from "rxjs";

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Use take(1) to ensure the observable completes immediately
//   return authService.currentUser$.pipe(
//     take(1), 
//     map(user => {
//       if (user && !user.isLocked) {
//         // If we have a user in memory, let them through immediately
//         return true;
//       } else {
//         // Only if there is NO user do we redirect
//         router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
//         return false;
//       }
//     })
//   );
// };








// import { inject } from "@angular/core";
// import { CanActivateFn, Router } from "@angular/router";
// import { AuthService } from "../../auth.service";
// import { map, take } from "rxjs";




// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // We call checkSession() on every route change to verify 
//   // the session hasn't been deleted by an Admin
//   return authService.checkSession().pipe(
//     // take(1),
//     map(user => {
//       if (user && !user.isLocked) {
//         return true;
//       } else {
//         // If user is null (session deleted) or locked, redirect to login
//         router.navigate(['/auth/login']);
//         return false;
//       }
//     })
//   );
// };