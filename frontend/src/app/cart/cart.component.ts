import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CartService } from './cart.service';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone:true,
  imports: [CommonModule,RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  
 cartItems$: Observable<any[]>;
  constructor(
    private cartService: CartService,
    private router: Router,
  ) {
    // Assign it here, after the service is injected
    // this.cartItems$ = this.cartService.cartItems$;
    this.cartItems$ = this.cartService.cartItems$ || of([]);
  }

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  changeQty(item: any, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty > 0 && newQty <= item.product.stockQuantity) {
      // Pass item.product.id here
      this.cartService.updateQuantity(item.product.id, newQty).subscribe();
    }
  }

  remove(productId: number): void {
    if (confirm('Are you sure you want to remove this item?')) {
      this.cartService.removeItem(productId).subscribe({
        next: () => {
          console.log('Item removed successfully');
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert('Could not remove item.');
        },
      });
    }
  }

  // calculateTotal(items: any[]): number {
  //   let total = 0;
  //   this.cartItems$.subscribe((items) => {
  //     total = items.reduce(
  //       (acc, item) => acc + item.product.price * item.quantity,
  //       0,
  //     );
  //   });
  //   return total;
  // }

  // goToCheckout(items: any[]): void {
  //   // Safety check: Don't allow checkout if cart was emptied somehow
  //   if (!items || items.length === 0) {
  //     alert('Your cart is empty. Add some products first!');
  //     return;
  //   }

  //   console.log('Navigating to checkout with items:', items);

  //   // Programmatically navigate to the /checkout route
  //   this.router.navigate(['/checkout']);
  // }

  // getImageUrl(imagePath: string | null | undefined): string {
  //   const BASE_URL = 'http://localhost:4000/ProductImages/';
  //   if (!imagePath || imagePath.trim() === '') {
  //     return `${BASE_URL}default-placeholder.png`;
  //   }
  //   if (imagePath.startsWith('http')) {
  //     return imagePath;
  //   }
  //   return `${BASE_URL}${imagePath.replace('ProductImages/', '')}`;
  // }

  getImageUrl(imagePath: string | null | undefined): string {
    const BASE_URL = "http://localhost:4000/ProductImages/";
    if (!imagePath) return BASE_URL + 'default-placeholder.png';
    // Removes the prefix if the DB already stored it with "ProductImages/"
    const filename = imagePath.replace('ProductImages/', '');
    return BASE_URL + filename;
  }

  calculateTotal(items: any[]): number {
    return items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
