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

  isLoading = false;
  isEditing = false;
  selectedFile: File | null = null;

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
          err
        );
      },
    });
  }


  addToCart() {
    if (!this.product) return;

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
    this.confirmType = 'SHARE';
    this.confirmMessage =
      'Link copied to the clipboard!';
    this.showConfirm = true;
  }

  confirmDelete() {
    this.confirmType = 'DELETE';
    this.confirmMessage = `Are you sure you want to permanently delete "${this.product?.name}"?`;
    this.showConfirm = true;
  }


  handleConfirmation(confirmed: boolean) {
    this.showConfirm = false;

    if (!confirmed) return;

    switch (this.confirmType) {
      case 'LOGIN_REQUIRED':
        this.router.navigate(['/auth/login']);
        break;
      case 'SHARE':
        this.executeShare();
        break;
      case 'DELETE':
        this.executeDelete();
        break;
    }
  }

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
    error: (err) => {
      this.isLoading = false;
      console.error('Delete error:', err);
      alert(err.error?.message || 'Failed to delete product');
    }
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
        console.log('Product updated:', res);
        
        this.isEditing = false;
        this.selectedFile = null;
        
        if (res) {
          this.product = res;
        }
        
        this.loadProductData(this.product!.id);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error saving product:', err);
        alert(err.error?.message || 'Failed to save product');
      },
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
