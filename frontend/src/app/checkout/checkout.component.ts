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

        if (items.length === 0 && !this.isPlacingOrder) {
          this.router.navigate(['/products']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  placeOrder() {
    const data = { paymentMethod: this.selectedPaymentMethod };

    this.http.post('http://localhost:4000/api/cart/checkout', data).subscribe({
      next: (res: any) => {

        this.isPlacingOrder = true;
        this.cartService.clearLocalCart();

        this.router.navigate(['/orders/confirmation'], {
          state: { order: res },
          replaceUrl: true,
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
