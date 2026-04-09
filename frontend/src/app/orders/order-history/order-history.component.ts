import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  private http = inject(HttpClient);
  orders: any[] = [];
  isLoading = true;

  ngOnInit() {
    // This matches your router.get("/my-orders", getMyOrders) backend route
    this.http.get<any[]>('http://localhost:4000/api/cart/my-orders').subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Could not load orders', err);
        this.isLoading = false;
      }
    });
  }
}