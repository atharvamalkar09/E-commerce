import { Routes } from '@angular/router';
import { CartComponent } from './cart.component';

export const CartRoute: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./cart.component').then(m => m.CartComponent) 
  }
];