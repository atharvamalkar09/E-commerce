import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent,ConfirmDialogComponent],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  private http = inject(HttpClient);
  
  orders: any[] = [];
  
  // UI States
  isLoading = false;
  showConfirm = false;
  confirmMessage = '';

  ngOnInit() {
    this.loadOrderHistory();
  }

  loadOrderHistory() {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:4000/api/cart/my-orders').subscribe({
      next: (data) => {
        this.orders = data;
        // Small delay for smooth UI transition
        setTimeout(() => {
          this.isLoading = false;
        }, 800);
      },
      error: (err) => {
        console.error('Could not load orders', err);
        this.isLoading = false;
      }
    });
  }

  // Placeholder for future actions (like Cancel Order)
  handleConfirmation(confirmed: boolean) {
    this.showConfirm = false;
    if (confirmed) {
      // Logic for confirmed action
    }
  }

  getImageUrl(imagePath: string | null | undefined): string {
    const BASE_URL = "http://localhost:4000/ProductImages/";
    if (!imagePath) return BASE_URL + 'default-placeholder.png';
    const filename = imagePath.replace('ProductImages/', '');
    return BASE_URL + filename;
  }
}









// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-order-history',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './order-history.component.html',
//   styleUrl: './order-history.component.css'
// })
// export class OrderHistoryComponent implements OnInit {
//   private http = inject(HttpClient);
//   orders: any[] = [];
//   isLoading = true;

//   ngOnInit() {
//     // This matches your router.get("/my-orders", getMyOrders) backend route
//     this.http.get<any[]>('http://localhost:4000/api/cart/my-orders').subscribe({
//       next: (data) => {
//         this.orders = data;
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Could not load orders', err);
//         this.isLoading = false;
//       }
//     });
//   }

//   getImageUrl(imagePath: string | null | undefined): string {
//   const BASE_URL = "http://localhost:4000/ProductImages/";
//   if (!imagePath) return BASE_URL + 'default-placeholder.png';
//   const filename = imagePath.replace('ProductImages/', '');
//   return BASE_URL + filename;
// }
// }