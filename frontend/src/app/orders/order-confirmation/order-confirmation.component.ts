import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirm-container">
      <div class="success-icon">✔</div>
      <h1>Order Placed Successfully!</h1>
      <p>Thank you for your purchase. Your order has been received.</p>
      
      <div class="order-details" *ngIf="orderData">
        <p><strong>Order ID:</strong> #{{ orderData.orderId }}</p>
        <p><strong>Total Paid:</strong> \${{ orderData.total }}</p>
      </div>

      <div class="actions">
        <button routerLink="/products" class="btn-secondary">Continue Shopping</button>
        <button routerLink="/orders/history" class="btn-primary">View My Orders</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-container { text-align: center; padding: 50px; border: 1px solid #eee; margin-top: 50px; }
    .success-icon { font-size: 50px; color: green; }
    .order-details { background: #f9f9f9; padding: 20px; margin: 20px auto; max-width: 400px; border-radius: 8px; }
    .actions { display: flex; gap: 10px; justify-content: center; }
    .btn-primary { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
    .btn-secondary { background: #6c757d; color: white; padding: 10px 20px; border: none; cursor: pointer; }
  `]
})
export class OrderConfirmationComponent {
  orderData: any;

  constructor(private router: Router) {
    // Retrieve the data passed from the Checkout component
    const navigation = this.router.getCurrentNavigation();
    this.orderData = navigation?.extras.state?.['order'];
  }
}