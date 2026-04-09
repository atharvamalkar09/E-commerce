import { Routes } from "@angular/router";
import { authGuard } from "./auth/guards/auth/auth.guard";
import { ProfileComponent } from "./auth/profile/profile.component";
import { adminGuard } from "./auth/guards/admin/admin.guard";

export const routes: Routes = [

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    // This lazily loads the separate routes file
    loadChildren: () => import('./admin/admin.routes').then(m => m.AdminRoutes)
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.routes").then(m => m.AuthRoutes)
  },
  {
    path: "products",
    // For now, let's just point to Login until we build the Product component
    loadChildren: () => import('./products/products.route').then(m => m.ProductRoutes),
    pathMatch: 'prefix'
  },

  {
    path: 'cart',
    // Lazy load the entire cart routing module
    loadChildren: () => import('./cart/cart.route').then(m => m.CartRoute),
    canActivate: [authGuard] 
  },

 {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard] // Ensure the user is logged in
  },
  // { path: 'orders', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'orders/confirmation',
    loadComponent: () => import('./orders/order-confirmation/order-confirmation.component')
                          .then(m => m.OrderConfirmationComponent),
    canActivate: [authGuard]
  },
  
  // We should also add the Order History route while we are here (Requirement 10)
  {
    path: 'orders/history',
    loadComponent: () => import('./orders/order-history/order-history.component')
                          .then(m => m.OrderHistoryComponent),
    canActivate: [authGuard]
  },

  // { path: 'profile', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'user/profile', loadComponent: () => import('./auth/profile/profile.component')
                          .then(m => m.ProfileComponent),
    canActivate: [authGuard] },
  
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: '**', redirectTo: 'products' }
];



// import { Routes } from '@angular/router';
// import { authGuard } from './auth/guards/auth.guard';
// import { adminGuard } from './auth/guards/admin.guard';

// export const routes: Routes = [
//   { 
//     path: 'auth', 
//     loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) 
//   },
//   { 
//     path: 'products', 
//     loadChildren: () => import('./products/product.routes').then(m => m.PRODUCT_ROUTES) 
//   },
//   { 
//     path: 'customer', 
//     canActivate: [authGuard],
//     loadChildren: () => import('./customer/customer.routes').then(m => m.CUSTOMER_ROUTES) 
//   },
//   { 
//     path: 'admin', 
//     canActivate: [authGuard, adminGuard], // Must be logged in AND an admin
//     loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) 
//   },
//   { path: '', redirectTo: 'products', pathMatch: 'full' }
// ];