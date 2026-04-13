import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';


export const ProductRoutes: Routes = [
  
  { path: '', loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent) },

  { path: ':id', loadComponent: () => import('./product-details/product-details.component').then(m => m.ProductDetailsComponent) }
];