import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart/cart.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private isPlacingOrder = false;

  cartItems: any[] = [];
  totalAmount = 0;
  selectedPaymentMethod = '';
  errorMessage = '';

  // Requirement 9.2: Payment method selection
  paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'];

  ngOnInit() {
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.cartItems = items;
        this.totalAmount = items.reduce(
          (acc, i) => acc + i.product.price * i.quantity,
          0,
        );

        // If cart is empty, send them back to products (but not during order placement)
        if (items.length === 0 && !this.isPlacingOrder) {
          this.router.navigate(['/products']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //   placeOrder() {
  //   const data = { paymentMethod: this.selectedPaymentMethod };

  //   this.http.post('http://localhost:4000/api/cart/checkout', data).subscribe({
  //     next: (res: any) => {
  //       alert("Order Placed Successfully!");
  //       this.cartService.clearLocalCart(); // Clear frontend cart
  //       this.router.navigate(['/orders/confirmation'], { state: { order: res } });
  //     },
  //     error: (err) => {
  //       // If stock ran out between Cart and Checkout, the backend sends an error
  //       this.errorMessage = err.error?.message || "Something went wrong.";
  //     }
  //   });
  // }

  placeOrder() {
    const data = { paymentMethod: this.selectedPaymentMethod };

    this.http.post('http://localhost:4000/api/cart/checkout', data).subscribe({
      next: (res: any) => {
        // 1. Alert the user
        alert('Order Placed Successfully!');

        // 2. Set flag to prevent redirect during order placement
        this.isPlacingOrder = true;

        // 3. Wipe the cart state
        this.cartService.clearLocalCart();

        // 4. Navigate to confirmation page
        this.router.navigate(['/orders/confirmation'], {
          state: { order: res },
          replaceUrl: true, // Prevents going back to checkout
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Something went wrong.';
      },
    });
  }

  getImageUrl(imagePath: string | null | undefined): string {
    const BASE_URL = 'http://localhost:4000/ProductImages/';
    if (!imagePath) return BASE_URL + 'default-placeholder.png';
    const filename = imagePath.replace('ProductImages/', '');
    return BASE_URL + filename;
  }
}
