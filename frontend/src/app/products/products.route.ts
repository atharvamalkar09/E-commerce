import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';


export const ProductRoutes: Routes = [
  { path: '', component: ProductListComponent },
  { path: ':id', component: ProductDetailsComponent }

];