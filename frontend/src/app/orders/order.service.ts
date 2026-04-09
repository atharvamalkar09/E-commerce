// order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  // CHANGE THIS: from /api/orders to /api/cart
  private apiUrl = 'http://localhost:4000/api/cart'; 

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/all`);
  }

   getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateStatus(orderId: number, status: string): Observable<any> {
    // This will now hit: http://localhost:4000/api/cart/admin/order/ID/status
    return this.http.patch(`${this.apiUrl}/admin/order/${orderId}/status`, { status });
  }
}












// // order.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class OrderService {

//   private apiUrl = 'http://localhost:4000/api/cart';

//   constructor(private http: HttpClient) {}

//   // Admin: Get every order in the system
//   getAllOrders(): Observable<any[]> {
//     return this.http.get<any[]>(`${this.apiUrl}/admin/all`);
//   }

//   // Get specific details for one order
//   getOrderById(id: number): Observable<any> {
//     return this.http.get<any>(`${this.apiUrl}/${id}`);
//   }

//   // Optional: Update order status (Pending, Shipped, Delivered)
//   updateStatus(id: number, status: string): Observable<any> {
//     return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
//   }

// //   getAllOrdersAdmin(): Observable<any[]> {
// //   return this.http.get<any[]>(`${this.apiUrl}/admin/all-orders`);
// // }

// // updateOrderStatus(orderId: number, status: string): Observable<any> {
// //   return this.http.patch(`${this.apiUrl}/admin/order/${orderId}/status`, { status });
// // }
// }

