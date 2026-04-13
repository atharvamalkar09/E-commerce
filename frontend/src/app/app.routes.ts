import { Routes } from "@angular/router";
import { authGuard } from "./auth/guards/auth/auth.guard";
import { adminGuard } from "./auth/guards/admin/admin.guard";
 
export const routes: Routes = [

  { path: 'admin', canActivate: [authGuard, adminGuard], loadChildren: () => import('./admin/admin.routes').then(m => m.AdminRoutes) },

  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.AuthRoutes) },

  { path: 'products', loadChildren: () => import('./products/products.route').then(m => m.ProductRoutes), pathMatch: 'prefix' },

  { path: 'cart', loadChildren: () => import('./cart/cart.route').then(m => m.CartRoute), canActivate: [authGuard] },

  { path: 'checkout', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },

  { path: 'orders/confirmation', loadComponent: () => import('./orders/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent), canActivate: [authGuard] },

  { path: 'orders/history', loadComponent: () => import('./orders/order-history/order-history.component').then(m => m.OrderHistoryComponent), canActivate: [authGuard] },

  { path: 'user/profile', loadComponent: () => import('./auth/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },

  { path: '', loadComponent: () => import('./products/product-list/product-list.component').then(m => m.ProductListComponent) },
  
  { path: '**', redirectTo: '' }
];
