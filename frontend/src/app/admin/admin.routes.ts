import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: '',
    children: [
      // Add this new route
      // {
      //   path: 'dashboard',
      //   loadComponent: () =>
      //     import('./dashboard/dashboard.component').then(
      //       (m) => m.DashboardComponent,
      //     ),
      // },
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
      // Change the default redirect to dashboard
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
];
