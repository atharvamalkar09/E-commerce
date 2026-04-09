import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../orders/order.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ConfirmDialogComponent, LoadingSpinnerComponent],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css',
})
export class OrderManagementComponent implements OnInit {
  orders: any[] = [];
  selectedOrder: any = null;
  
  // UI States
  isLoading = false;
  showConfirm = false;
  confirmMessage = '';
  
  // Storage for status update info
  pendingUpdate: { orderId: number, newStatus: string } | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        // Small delay for clean transition
        setTimeout(() => (this.isLoading = false), 600);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  viewDetails(order: any) {
    this.selectedOrder = order;
  }

  closeDetails() {
    this.selectedOrder = null;
  }

  // --- Modal Logic ---
  onStatusChange(orderId: number, newStatus: string) {
    this.pendingUpdate = { orderId, newStatus };
    this.confirmMessage = `Are you sure you want to change Order #${orderId} status to ${newStatus}?`;
    this.showConfirm = true;
  }

  handleConfirmation(confirmed: boolean) {
    this.showConfirm = false;
    if (confirmed && this.pendingUpdate) {
      this.executeStatusUpdate(this.pendingUpdate.orderId, this.pendingUpdate.newStatus);
    } else {
      // If cancelled, we reload orders to reset the dropdown UI to previous state
      this.loadOrders();
    }
    this.pendingUpdate = null;
  }

  private executeStatusUpdate(orderId: number, newStatus: string) {
    this.isLoading = true;
    this.orderService.updateStatus(orderId, newStatus).subscribe({
      next: (res) => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.status = newStatus;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Failed to update status.');
      }
    });
  }

  getImageUrl(imagePath: string | null | undefined): string {
    const BASE_URL = "http://localhost:4000/ProductImages/";
    if (!imagePath) return BASE_URL + 'default-placeholder.png';
    const filename = imagePath.replace('ProductImages/', '');
    return BASE_URL + filename;
  }
}


















// import { Component } from '@angular/core';
// import { OrderService } from '../../orders/order.service';
// import { CommonModule, DatePipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-order-management',
//   imports: [CommonModule,DatePipe, FormsModule],
//   templateUrl: './order-management.component.html',
//   styleUrl: './order-management.component.css',
// })
// export class OrderManagementComponent {
//   orders: any[] = [];
//   selectedOrder: any = null;

//   orderStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];


//   constructor(private orderService: OrderService) {}

//   ngOnInit() {
//     this.loadOrders();
//   }

//   loadOrders() {
//     this.orderService.getAllOrders().subscribe((data) => (this.orders = data));
//   }

//   viewDetails(order: any) {
//     this.selectedOrder = order;
//   }

//   closeDetails() {
//     this.selectedOrder = null;
//   }

//   updateStatus(order: any, newStatus: string) {
//   // Optional: Add a confirmation dialog
//   if (confirm(`Change order #${order.id} status to ${newStatus}?`)) {
//     this.orderService.updateStatus(order.id, newStatus).subscribe({
//       next: (updatedOrder) => {
//         order.status = newStatus; // Update UI locally
//         alert('Status updated successfully!');
//       },
//       error: (err) => {
//         console.error('Update failed', err);
//         alert('Failed to update status. Please try again.');
//       }
//     });
//   }
// }

// onStatusChange(orderId: number, newStatus: string) {
//   this.orderService.updateStatus(orderId, newStatus).subscribe({
//     next: (res) => {
//       // Find the order in our local list and update its status
//       const order = this.orders.find(o => o.id === orderId);
//       if (order) order.status = newStatus;
      
//       alert(`Order #${orderId} updated to ${newStatus}`);
//     },
//     error: (err) => {
//       console.error(err);
//       alert('Failed to update status. Please check your connection.');
//     }
//   });
// }
//   getImageUrl(imagePath: string | null | undefined): string {
//   const BASE_URL = "http://localhost:4000/ProductImages/";
//   if (!imagePath) return BASE_URL + 'default-placeholder.png';
//   const filename = imagePath.replace('ProductImages/', '');
//   return BASE_URL + filename;
// }
// }
