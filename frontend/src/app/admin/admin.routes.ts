import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'products',
        loadComponent: () =>
          import('./product-management/product-management.component').then(
            (m) => m.ProductManagementComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./user-management/user-management.component').then(
            (m) => m.UserManagementComponent,
          ),
      },

      {
        path: 'orders',
        loadComponent: () =>
          import('./order-management/order-management.component').then(
            (m) => m.OrderManagementComponent,
          ),
      },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
];
