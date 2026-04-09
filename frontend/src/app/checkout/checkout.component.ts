import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private http = inject(HttpClient);
  private router = inject(Router);

  cartItems: any[] = [];
  totalAmount = 0;
  selectedPaymentMethod = '';
  errorMessage = '';

  // Requirement 9.2: Payment method selection
  paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'];

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.totalAmount = items.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
      
      // If cart is empty, send them back to products
      if (items.length === 0) {
        this.router.navigate(['/products']);
      }
    });
  }

  placeOrder() {
  const data = { paymentMethod: this.selectedPaymentMethod };

  this.http.post('http://localhost:4000/api/cart/checkout', data).subscribe({
    next: (res: any) => {
      alert("Order Placed Successfully!");
      this.cartService.clearLocalCart(); // Clear frontend cart
      this.router.navigate(['/orders/confirmation'], { state: { order: res } });
    },
    error: (err) => {
      // If stock ran out between Cart and Checkout, the backend sends an error
      this.errorMessage = err.error?.message || "Something went wrong.";
    }
  });
}
}