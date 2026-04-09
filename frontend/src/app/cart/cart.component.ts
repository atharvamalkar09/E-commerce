import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CartService } from './cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartItems$; // Declare the property type

  constructor(private cartService: CartService, private router: Router) {
    // Assign it here, after the service is injected
    this.cartItems$ = this.cartService.cartItems$; 
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
      }
    });
  }
}

  calculateTotal(items:any[]): number {
    let total = 0;
    this.cartItems$.subscribe(items => {
      total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    });
    return total;
  }

  goToCheckout(items: any[]): void {
    // Safety check: Don't allow checkout if cart was emptied somehow
    if (!items || items.length === 0) {
      alert("Your cart is empty. Add some products first!");
      return;
    }

    console.log('Navigating to checkout with items:', items);
    
    // Programmatically navigate to the /checkout route
    this.router.navigate(['/checkout']);
  }

}
