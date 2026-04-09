import { Component } from '@angular/core';
import { OrderService } from '../../orders/order.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-management',
  imports: [CommonModule,DatePipe, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css',
})
export class OrderManagementComponent {
  orders: any[] = [];
  selectedOrder: any = null;

  orderStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];


  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe((data) => (this.orders = data));
  }

  viewDetails(order: any) {
    this.selectedOrder = order;
  }

  closeDetails() {
    this.selectedOrder = null;
  }

  updateStatus(order: any, newStatus: string) {
  // Optional: Add a confirmation dialog
  if (confirm(`Change order #${order.id} status to ${newStatus}?`)) {
    this.orderService.updateStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        order.status = newStatus; // Update UI locally
        alert('Status updated successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Failed to update status. Please try again.');
      }
    });
  }
}

onStatusChange(orderId: number, newStatus: string) {
  this.orderService.updateStatus(orderId, newStatus).subscribe({
    next: (res) => {
      // Find the order in our local list and update its status
      const order = this.orders.find(o => o.id === orderId);
      if (order) order.status = newStatus;
      
      alert(`Order #${orderId} updated to ${newStatus}`);
    },
    error: (err) => {
      console.error(err);
      alert('Failed to update status. Please check your connection.');
    }
  });
}
}
