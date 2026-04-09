import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AuthRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
];






// import { Routes } from '@angular/router';
// import { LoginComponent } from './login/login.component';


// // This MUST be named exactly 'AuthRoutes' to match your import above
// export const AuthRoutes: Routes = [
//   { path: 'login', component: LoginComponent },
// //   { path: 'register', component: RegisterComponent }
// ];




// import { Routes } from '@angular/router';

// export const AUTH_ROUTES: Routes = [
//   {
//     path: '',
//     loadComponent: () =>
//       import('./login/login')
//         .then(m => m.LoginComponent)
//   },
//   {
//     path: 'register',
//     loadComponent: () =>
//       import('./register/register')
//         .then(m => m.Register)
//   }
// ];