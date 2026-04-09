import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private API_URL = 'http://localhost:4000/api/cart';

  constructor(private http: HttpClient) {}

  // Load cart from DB on login
  loadCart() {
    return this.http.get<any[]>(this.API_URL).subscribe((items) => {
      this.cartItemsSubject.next(items);
    });
  }

  addToCart(product: Product, quantity: number) {
    // Add "/add" to the end of the URL
    return this.http
      .post(`${this.API_URL}/add`, {
        productId: product.id,
        quantity,
      })
      .pipe(tap(() => this.loadCart()));
  }

 updateQuantity(productId: number, quantity: number) {
  // Use the specific /update endpoint
  return this.http.patch('http://localhost:4000/api/cart/update', { 
    productId, 
    quantity 
  }).pipe(tap(() => this.loadCart()));
}

removeItem(productId: number) {
  // The URL must match the backend: /api/cart/remove/ID
  const url = `http://localhost:4000/api/cart/remove/${productId}`;
  
  return this.http.delete(url).pipe(
    tap(() => {
      this.loadCart(); // Refresh the list after deleting
    })
  );
}

  clearLocalCart() {
    this.cartItemsSubject.next([]);
  }
}
