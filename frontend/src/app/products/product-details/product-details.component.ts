import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../product.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { getImageUrl, handleImageError } from '../../shared/utils/image.utils';

@Component({
  selector: 'app-product-details',
  standalone: true,
  // Added FormsModule to imports
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  product?: Product;
  isLoggedIn: boolean = false;
  public apiURL = 'http://localhost:4000';

  // --- Edit Mode States ---
  isEditing: boolean = false;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProductData(+id);
    }

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  loadProductData(id: number) {
    this.productService.getProductById(id).subscribe(res => {
      this.product = res;
    });
  }

  // --- Toggle Edit Mode ---
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.selectedFile = null; // Cleanup if canceled
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // --- Save Logic ---
  saveProduct() {
  if (!this.product) return;

  const fd = new FormData();
  fd.append('name', this.product.name);
  fd.append('description', this.product.description || '');
  fd.append('price', this.product.price.toString());
  fd.append('stockQuantity', this.product.stockQuantity.toString());

  if (this.selectedFile) {
    fd.append('image', this.selectedFile);
  }

  this.productService.updateProduct(this.product.id, fd).subscribe({
    next: (res: any) => {
      alert('Product updated successfully!');
      
      // FIX: Extract the product object from the response
      // Your backend returns { message: string, product: Product }
      if (res && res.product) {
        this.product = res.product;
      } else {
        // Fallback: If response structure is unexpected, re-load by ID
        this.loadProductData(this.product!.id);
      }

      this.isEditing = false;
      this.selectedFile = null;
    },
    error: (err) => {
      console.error('Update failed', err);
      alert('Failed to update product.');
    }
  });
}
  // saveProduct() {
  //   if (!this.product) return;

  //   const fd = new FormData();
  //   fd.append('name', this.product.name);
  //   fd.append('description', this.product.description || '');
  //   fd.append('price', this.product.price.toString());
  //   fd.append('stockQuantity', this.product.stockQuantity.toString());

  //   if (this.selectedFile) {
  //     fd.append('image', this.selectedFile);
  //   }

  //   // Call your ProductService. Update the service if you haven't added updateProduct yet!
  //   this.productService.updateProduct(this.product.id, fd).subscribe({
  //     next: (updatedProduct) => {
  //       alert('Product updated successfully!');
  //       this.product = updatedProduct; // Update the UI
  //       this.isEditing = false;
  //       this.selectedFile = null;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       alert('Failed to update product.');
  //     }
  //   });
  // }

  shareProduct() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Product link copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  addToCart() {
    if (!this.product) return;

    if (this.product.stockQuantity <= 0) {
      alert("This item is currently out of stock.");
      return;
    }

    this.cartService.addToCart(this.product, 1).subscribe({
      next: () => {
        alert('Added to cart successfully!');
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        alert(err.error?.message || "Failed to add to cart");
      }
    });
  }
  confirmDelete() {
  if (!this.product) return;

  const confirmAction = confirm(`Are you sure you want to delete "${this.product.name}"?`);
  
  if (confirmAction) {
    // Pass only the numeric ID
    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        alert('Product deleted successfully.');
        this.router.navigate(['/products']); // Redirect away from the deleted item
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Delete failed. Check the console for URL errors.');
      }
    });
  }
}

  // --- Image Utility Methods ---
  // getImageUrl(imagePath: string | null | undefined): string {
  //   return getImageUrl(imagePath, this.apiURL);
  // }

  getImageUrl(imagePath: string | null | undefined): string {
  // If the backend already sent the full URL (which it does via ensureProductImage)
  if (imagePath && imagePath.startsWith('http')) {
    return imagePath;
  }

  // Fallback for safety if for some reason the backend sends a partial path
  if (imagePath) {
    return `${this.apiURL}/ProductImages/${imagePath.replace('ProductImages/', '')}`;
  }

  // Default placeholder
  return `${this.apiURL}/ProductImages/default-placeholder.png`;
}

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.warn('Image failed to load:', img.src);
    handleImageError(event);
    // event.target.src = 'http://localhost:4000/ProductImages/default-placeholder.png';
  }
}













// import { Component, OnInit } from '@angular/core';
// import { Product } from '../../models/product.model';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { ProductService } from '../product.service';
// import { AuthService } from '../../auth/auth.service';
// import { CommonModule } from '@angular/common';
// import { CartService } from '../../cart/cart.service';

// @Component({
//   selector: 'app-product-details',
//   imports: [CommonModule,RouterLink],
//   templateUrl: './product-details.component.html',
//   styleUrl: './product-details.component.css'
// })
// export class ProductDetailsComponent implements OnInit {

//   product?: Product;
//   isLoggedIn: boolean = false;
//   public apiURL = 'http://localhost:4000';

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
//       this.productService.getProductById(+id).subscribe(res => {
//         this.product = res;
//       });
//     }

//     // Check if user is logged in to show "Add to Cart"
//     this.authService.currentUser$.subscribe(user => {
//       this.isLoggedIn = !!user;
//     });
//   }

//   // Requirement 13.3: Share Button Logic
//   shareProduct() {
//     const url = window.location.href;
//     navigator.clipboard.writeText(url).then(() => {
//       alert('Product link copied to clipboard!');
//     }).catch(err => {
//       console.error('Could not copy text: ', err);
//     });
//   }

//   addToCart() {
//   if (!this.product) return;

//   // Requirement 13.1: Check stock before calling API
//   if (this.product.stockQuantity <= 0) {
//     alert("This item is currently out of stock.");
//     return;
//   }

//   this.cartService.addToCart(this.product, 1).subscribe({
//     next: () => {
//       alert('Added to cart successfully!');
//       console.log("Product added to cart");
//       this.router.navigate(['/cart']); // Optional: redirect to cart to see it
//     },
//     error: (err) => {
//       console.error(err);
//       alert(err.error?.message || "Failed to add to cart");
//     }
//   });


// }

// }
