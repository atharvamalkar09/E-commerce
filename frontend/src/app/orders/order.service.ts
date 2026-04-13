
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {

  private apiUrl = 'http://localhost:4000/api/cart'; 

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/all`);
  }

   getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateStatus(orderId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/order/${orderId}/status`, { status });
  }
}

