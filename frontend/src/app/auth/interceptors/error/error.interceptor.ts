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
      if ((err.status === 401 || err.status === 403) && !req.url.includes('/api/auth/me')) {
    
        authService.clearLocalSession(); 
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};
