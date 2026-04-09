import { Component, OnInit, inject } from '@angular/core';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../product.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  isLoggedIn: boolean = false;
  public apiURL = 'http://localhost:4000';

  // UI States
  isLoading = false;
  isEditing = false;
  selectedFile: File | null = null;

  // Dialog States
  showConfirm = false;
  confirmMessage = '';
  confirmType: 'DELETE' | 'LOGIN_REQUIRED' | 'SHARE' = 'DELETE';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public authService: AuthService,
    private cartService: CartService,
    private router: Router,
  ) {}

  // ngOnInit(): void {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (id) {
  //     this.loadProductData(+id);
  //   }

  //   this.authService.currentUser$.subscribe(user => {
  //     this.isLoggedIn = !!user;
  //   });
  // }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProductData(+id);
    }

    // Subscribe to auth state changes to track login status
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  // loadProductData(id: number) {
  //   this.isLoading = true;
  //   this.productService.getProductById(id).subscribe({
  //     next: (res) => {
  //       this.product = res;
  //       this.isLoading = false;
  //     },
  //     error: () => this.isLoading = false
  //   });
  // }

  loadProductData(id: number) {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(
          'Error loading product. If this is a 401, check if your backend allows public GET requests for products.',
        );
      },
    });
  }

  // --- Dialog Triggers ---

  addToCart() {
    if (!this.product) return;

    // Trigger 1: If not logged in, show dialog
    if (!this.isLoggedIn) {
      this.confirmType = 'LOGIN_REQUIRED';
      this.confirmMessage =
        'You need to be logged in to add items to your cart. Go to login page?';
      this.showConfirm = true;
      return;
    }

    if (this.product.stockQuantity <= 0) return;

    this.isLoading = true;
    this.cartService.addToCart(this.product, 1).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Failed to add to cart');
      },
    });
  }

  shareProduct() {
    // Trigger 2: Share confirmation
    this.confirmType = 'SHARE';
    this.confirmMessage =
      'Would you like to copy the product link to your clipboard?';
    this.showConfirm = true;
  }

  confirmDelete() {
    // Trigger 3: Admin Delete
    this.confirmType = 'DELETE';
    this.confirmMessage = `Are you sure you want to permanently delete "${this.product?.name}"?`;
    this.showConfirm = true;
  }

  // --- Dialog Logic ---

  // handleConfirmation(confirmed: boolean) {
  //   this.showConfirm = false;

  //   if (!confirmed) return;

  //   if (this.confirmType === 'LOGIN_REQUIRED') {
  //     this.router.navigate(['/auth/login']);
  //   }
  //   else if (this.confirmType === 'SHARE') {
  //     this.executeShare();
  //   }
  //   else if (this.confirmType === 'DELETE') {
  //     this.executeDelete();
  //   }
  // }

  handleConfirmation(confirmed: boolean) {
    this.showConfirm = false;

    if (!confirmed) return;

    switch (this.confirmType) {
      case 'LOGIN_REQUIRED':
        this.router.navigate(['/auth/login']);
        break;
      case 'SHARE':
        this.executeShare(); // Now it copies silently without an alert
        break;
      case 'DELETE':
        this.executeDelete();
        break;
    }
  }

  // --- Actions ---

  private executeShare() {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log('Product link copied to clipboard successfully.');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  }

  private executeDelete() {
    if (!this.product) return;
    this.isLoading = true;
    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/products']);
      },
      error: () => (this.isLoading = false),
    });
  }

  saveProduct() {
    if (!this.product) return;
    this.isLoading = true;
    const fd = new FormData();
    fd.append('name', this.product.name);
    fd.append('description', this.product.description || '');
    fd.append('price', this.product.price.toString());
    fd.append('stockQuantity', this.product.stockQuantity.toString());

    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.productService.updateProduct(this.product.id, fd).subscribe({
      next: (res: any) => {
        if (res && res.product) this.product = res.product;
        this.isEditing = false;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.selectedFile = null;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (imagePath && imagePath.startsWith('http')) return imagePath;
    if (imagePath)
      return `${this.apiURL}/ProductImages/${imagePath.replace('ProductImages/', '')}`;
    return `${this.apiURL}/ProductImages/default-placeholder.png`;
  }

  onImageError(event: any) {
    event.target.src = `${this.apiURL}/ProductImages/default-placeholder.png`;
  }
}

// import { Component, OnInit } from '@angular/core';
// import { Product } from '../../models/product.model';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { ProductService } from '../product.service';
// import { AuthService } from '../../auth/auth.service';
// import { CommonModule } from '@angular/common';
// import { CartService } from '../../cart/cart.service';
// import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
// import { getImageUrl, handleImageError } from '../../shared/utils/image.utils';

// @Component({
//   selector: 'app-product-details',
//   standalone: true,
//   // Added FormsModule to imports
//   imports: [CommonModule, FormsModule],
//   templateUrl: './product-details.component.html',
//   styleUrl: './product-details.component.css'
// })
// export class ProductDetailsComponent implements OnInit {

//   product?: Product;
//   isLoggedIn: boolean = false;
//   public apiURL = 'http://localhost:4000';

//   // --- Edit Mode States ---
//   isEditing: boolean = false;
//   selectedFile: File | null = null;

//   constructor(
//     private route: ActivatedRoute,
//     private productService: ProductService,
//     public authService: AuthService,
//     private cartService: CartService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('id');
//     if (id) {
//       this.loadProductData(+id);
//     }

//     this.authService.currentUser$.subscribe(user => {
//       this.isLoggedIn = !!user;
//     });
//   }

//   loadProductData(id: number) {
//     this.productService.getProductById(id).subscribe(res => {
//       this.product = res;
//     });
//   }

//   // --- Toggle Edit Mode ---
//   toggleEdit() {
//     this.isEditing = !this.isEditing;
//     if (!this.isEditing) {
//       this.selectedFile = null; // Cleanup if canceled
//     }
//   }

//   onFileSelected(event: any) {
//     this.selectedFile = event.target.files[0];
//   }

//   // --- Save Logic ---
//   saveProduct() {
//   if (!this.product) return;

//   const fd = new FormData();
//   fd.append('name', this.product.name);
//   fd.append('description', this.product.description || '');
//   fd.append('price', this.product.price.toString());
//   fd.append('stockQuantity', this.product.stockQuantity.toString());

//   if (this.selectedFile) {
//     fd.append('image', this.selectedFile);
//   }

//   this.productService.updateProduct(this.product.id, fd).subscribe({
//     next: (res: any) => {
//       alert('Product updated successfully!');

//       // FIX: Extract the product object from the response
//       // Your backend returns { message: string, product: Product }
//       if (res && res.product) {
//         this.product = res.product;
//       } else {
//         // Fallback: If response structure is unexpected, re-load by ID
//         this.loadProductData(this.product!.id);
//       }

//       this.isEditing = false;
//       this.selectedFile = null;
//     },
//     error: (err) => {
//       console.error('Update failed', err);
//       alert('Failed to update product.');
//     }
//   });
// }
//   shareProduct() {
//     const url = window.location.href;
//     navigator.clipboard.writeText(url).then(() => {
//       alert('Product link copied to clipboard!');
//     }).catch(err => {
//       console.error('Could not copy text: ', err);
//     });
//   }

//   addToCart() {
//     if (!this.product) return;

//     if (this.product.stockQuantity <= 0) {
//       alert("This item is currently out of stock.");
//       return;
//     }

//     this.cartService.addToCart(this.product, 1).subscribe({
//       next: () => {
//         alert('Added to cart successfully!');
//         this.router.navigate(['/cart']);
//       },
//       error: (err) => {
//         alert(err.error?.message || "Failed to add to cart");
//       }
//     });
//   }
//   confirmDelete() {
//   if (!this.product) return;

//   const confirmAction = confirm(`Are you sure you want to delete "${this.product.name}"?`);

//   if (confirmAction) {
//     // Pass only the numeric ID
//     this.productService.deleteProduct(this.product.id).subscribe({
//       next: () => {
//         alert('Product deleted successfully.');
//         this.router.navigate(['/products']); // Redirect away from the deleted item
//       },
//       error: (err) => {
//         console.error('Delete failed', err);
//         alert('Delete failed. Check the console for URL errors.');
//       }
//     });
//   }
// }
//   getImageUrl(imagePath: string | null | undefined): string {
//   // If the backend already sent the full URL (which it does via ensureProductImage)
//   if (imagePath && imagePath.startsWith('http')) {
//     return imagePath;
//   }

//   // Fallback for safety if for some reason the backend sends a partial path
//   if (imagePath) {
//     return `${this.apiURL}/ProductImages/${imagePath.replace('ProductImages/', '')}`;
//   }

//   // Default placeholder
//   return `${this.apiURL}/ProductImages/default-placeholder.png`;
// }

//   onImageError(event: Event): void {
//     const img = event.target as HTMLImageElement;
//     console.warn('Image failed to load:', img.src);
//     handleImageError(event);
//     // event.target.src = 'http://localhost:4000/ProductImages/default-placeholder.png';
//   }
// }
