import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { Product } from '../../models/product.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { getImageUrl, handleImageError } from '../../shared/utils/image.utils';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  totalItems = 0;
  types: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];

  // Search stream for debounce (Requirement 8.1)
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private taxonomySubscriptions: Subscription[] = [];

  // Filter state (Requirement 8.2 & 8.3)
  filters = {
    search: '',
    minPrice: '',
    maxPrice: '',
    typeId: '', // Added
    catId: '', // Added
    subCatId: '',
    page: 1,
    limit: 10,
  };

  /** * CHANGE: Removed the trailing slash.
   * We will handle the slash manually in the HTML template
   * to ensure the path is always clean: http://localhost:4000/ProductImages/...
   */
  public apiUrl = 'http://localhost:4000';

  constructor(
    private productService: ProductService,
    public authService: AuthService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadTaxonomy();

    // Setup Debounce: Wait 400ms after user stops typing
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        this.filters.search = value;
        this.filters.page = 1; // Reset to first page on new search
        this.loadProducts();
      });
  }

  loadTaxonomy() {
    this.taxonomySubscriptions.push(
      this.productService.getTypes().subscribe((data) => (this.types = data)),
      this.productService
        .getCategories()
        .subscribe((data) => (this.categories = data)),
      this.productService
        .getSubCategories()
        .subscribe((data) => (this.subCategories = data)),
    );
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  loadProducts(): void {
    this.productService.getProducts(this.filters).subscribe({
      next: (res) => {
        this.products = res.items;
        this.totalItems = res.total;
      },
      error: (err) => console.error('Error fetching products', err),
    });
  }

  addToCart(product: any) {
    // Your cart service logic here
    console.log('Adding to cart:', product.name);
  }
  applyFilters() {
    this.filters.page = 1;
    this.loadProducts();
  }


  getImageUrl(imagePath: string | null | undefined): string {
    // 1. If path is missing, use a hardcoded fallback
    if (!imagePath) {
      return 'http://localhost:4000/ProductImages/default-placeholder.png';
    }

    // 2. If the backend already sent the full URL (which it now does), return it directly.
    // This prevents the "Double Folder" or "Double URL" issue.
    return imagePath;
  }

  /**
   * IMPROVED: Handle errors gracefully if the URL exists but the file is missing
   */
  onImageError(event: any) {
    console.warn('Image failed to load, switching to placeholder:', event.target.src);
    // Use the absolute path to your placeholder
    event.target.src = 'http://localhost:4000/ProductImages/default-placeholder.png';
  }

  /**
   * Optional: Helper method to get the correct role for the UI
   */
  // getImageUrl(imagePath: string | null | undefined): string {
  //   return getImageUrl(imagePath, this.apiUrl);
  // }

  // getImageUrl(imagePath: string): string {
  //   if (!imagePath) {
  //     return 'http://localhost:4000/ProductImages/default-placeholder.png';
  //   }

  //   // If the path already includes "http", return it as is
  //   if (imagePath.startsWith('http')) {
  //     return imagePath;
  //   }

  //   // If your DB stores "ProductImages/filename.jpg",
  //   // and your static route is "/ProductImages",
  //   // you might be doubling up the prefix.

  //   // This cleans up the path to ensure it's just http://localhost:4000/ProductImages/filename.jpg
  //   const cleanPath = imagePath.replace('ProductImages/', '');
  //   return `http://localhost:4000/ProductImages/${cleanPath}`;
  // }

  // onImageError(event: any) {
  //   // If the image fails to load, swap it with the local placeholder
  //   event.target.src = 'assets/images/default-placeholder.png'; // Or your backend URL
  // }

  // onImageError(event: Event): void {
  //   const img = event.target as HTMLImageElement;
  //   console.warn('Image failed to load:', img.src);
  //   handleImageError(event);
  // }
  get isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'admin';
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.taxonomySubscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * TrackBy function to optimize *ngFor performance
   * Prevents unnecessary re-renders and DOM rebuilds
   */
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}

// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { ProductService } from '../product.service';
// import { Product } from '../../models/product.model';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Subject, Subscription } from 'rxjs';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// @Component({
//   selector: 'app-product-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './product-list.component.html',
//   styleUrls: ['./product-list.component.css']
// })
// export class ProductListComponent implements OnInit, OnDestroy {
//   products: Product[] = [];
//   public apiUrl = 'http://localhost:4000/';

//   // RxJS Subject to handle the stream of search characters
//   private searchSubject = new Subject<string>();
//   private searchSubscription?: Subscription;

//   // Track filter state (Added subCatId and pagination for Req 8.2 & 8.3)
//   filters = {
//     search: '',
//     minPrice: '',
//     maxPrice: '',
//     subCatId: '',
//     page: 1,
//     limit: 10
//   };

//   totalItems = 0;
//   totalPages = 0;

//   constructor(private productService: ProductService) {}

//   ngOnInit(): void {
//     // 1. Initial Load
//     this.loadProducts();

//     // 2. Setup Debounce for Search (Requirement 8.1)
//     this.searchSubscription = this.searchSubject.pipe(
//       debounceTime(400),       // Wait 400ms after user stops typing
//       distinctUntilChanged()   // Only trigger if the value is different from last time
//     ).subscribe((searchTerm) => {
//       this.filters.search = searchTerm;
//       this.filters.page = 1;   // Reset to page 1 on new search
//       this.loadProducts();
//     });
//   }

//   // Triggered by (input) event in HTML
//   onSearchInputChange(event: Event): void {
//     const value = (event.target as HTMLInputElement).value;
//     this.searchSubject.next(value);
//   }

//   // Generic load method for all filters (Requirement 8.3)
//   loadProducts(): void {
//     this.productService.getProducts(this.filters).subscribe({
//       next: (res) => {
//         this.products = res.items;
//         this.totalItems = res.total;
//         this.totalPages = res.totalPages;
//       },
//       error: (err) => console.error('Search failed', err)
//     });
//   }

//   onReset(): void {
//     this.filters = {
//       search: '',
//       minPrice: '',
//       maxPrice: '',
//       subCatId: '',
//       page: 1,
//       limit: 10
//     };
//     this.loadProducts();
//   }

//   ngOnDestroy(): void {
//     // Clean up subscription to prevent memory leaks
//     this.searchSubscription?.unsubscribe();
//   }
// }

// // import { Component, OnInit } from '@angular/core';
// // import { ProductService } from '../product.service';
// // import { Product } from '../../models/product.model';
// // import { FormsModule } from '@angular/forms'; // Import this!
// // import { CommonModule } from '@angular/common';

// // @Component({
// //   selector: 'app-product-list',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule],
// //   templateUrl: './product-list.component.html',
// //   styleUrls: ['./product-list.component.css']
// // })
// // export class ProductListComponent implements OnInit {
// //   products: Product[] = [];
// //   readonly API_BASE_URL = 'http://localhost:4000/';

// //   // Track filter state
// //   filters = {
// //     search: '',
// //     minPrice: '',
// //     maxPrice: ''
// //   };

// //   constructor(private productService: ProductService) {}

// //   ngOnInit(): void {
// //     this.loadProducts();
// //   }

// //   // This method calls your service with the current filter state
// //   loadProducts(): void {
// //     this.productService.getProducts(this.filters).subscribe({
// //       next: (res) => {
// //         this.products = res.items;
// //       },
// //       error: (err) => console.error('Search failed', err)
// //     });
// //   }

// //   onReset(): void {
// //     this.filters = { search: '', minPrice: '', maxPrice: '' };
// //     this.loadProducts();
// //   }
// // }

// // import { Component, OnInit } from '@angular/core';
// // import { Product } from '../../models/product.model';
// // import { ProductService } from '../product.service';
// // import { FormsModule } from '@angular/forms';
// // import { CommonModule } from '@angular/common';

// // @Component({
// //   selector: 'app-product-list',
// //   imports: [CommonModule],
// //   templateUrl: './product-list.component.html',
// //   styleUrl: './product-list.component.css'
// // })
// // export class ProductListComponent implements OnInit {

// //   products: Product[] = [];
// //   totalItems = 0;
// //   currentPage = 1;

// //   public apiURL = 'http://localhost:4000/';

// //   constructor(private productService: ProductService) {}

// //   ngOnInit(): void {
// //     this.loadProducts();
// //   }

// //   loadProducts(page: number = 1): void {
// //     this.productService.getProducts({ page, limit: 10 }).subscribe({
// //       next: (res) => {
// //         this.products = res.items; // Backend sends array here
// //         this.totalItems = res.total;
// //         this.currentPage = res.page;
// //       },
// //       error: (err) => console.error('Failed to load products', err)
// //     });
// //   }

// //   // Example for a search bar
// //   onSearch(term: string) {
// //     this.productService.getProducts({ search: term }).subscribe(res => {
// //       this.products = res.items;
// //     });
// //   }

// // }
