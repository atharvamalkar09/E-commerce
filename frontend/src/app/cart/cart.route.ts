import { Routes } from '@angular/router';
import { CartComponent } from './cart.component';

export const CartRoute: Routes = [
  { 
    path: '', 
    component: CartComponent 
  }
  // You could add { path: 'checkout', component: CheckoutComponent } here later
];