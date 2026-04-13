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
  
  isLoading = false;
  showConfirm = false;
  confirmMessage = '';
  
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
