import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth.service';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      // 401: Session expired | 403: Account Locked
      // BUT: Don't redirect on /api/auth/me because that endpoint returns 401 for unauthenticated users
      // The AuthService.checkSession() already handles this error gracefully
      if ((err.status === 401 || err.status === 403) && !req.url.includes('/api/auth/me')) {
        
        // 1. Clear the frontend state so the toggle button updates
        authService.clearLocalSession(); 
        
        // 2. Redirect to login
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};









// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, throwError } from 'rxjs';

// export const errorInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);

//   return next(req).pipe(
//     catchError((err) => {
//       // If backend returns 401, it means the sessionStore entry is gone
//       if (err.status === 401) {
//         router.navigate(['/auth/login']);
//       }
//       return throwError(() => err);
//     })
//   );
// };