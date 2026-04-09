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
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit, OnDestroy {
  isLoading = false;
  products: Product[] = [];
  totalItems = 0;
  types: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];

  filteredCategories: any[] = [];
  filteredSubCategories: any[] = [];

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

  filterCategories() {
  // 1. If no type is selected, clear categories or show all
  if (!this.filters.typeId) {
    this.filteredCategories = []; 
    return;
  }

  // 2. Filter the master 'categories' list
  // Note: Check your backend response. If category has 'typeId', use c.typeId.
  // If category has a type object, use c.type.id
  const selectedTypeId = Number(this.filters.typeId);

  this.filteredCategories = this.categories.filter(c => {
    // Try both common naming conventions
    const typeId = c.typeId || c.type?.id;
    return Number(typeId) === selectedTypeId;
  });

  console.log('Filtered Categories:', this.filteredCategories); // Debugging line
}

onTypeChange() {
  this.filters.catId = ''; // Reset category selection when type changes
  this.filterCategories();
  this.applyFilters();
}
onCategoryChange() {
    this.filters.subCatId = ''; // Reset sub-category selection
    this.filterSubCategories();
    this.applyFilters();
  }

 filterSubCategories() {
  // 1. If no category is selected, clear the list
  if (!this.filters.catId) {
    this.filteredSubCategories = [];
    return;
  }

  const selectedCatId = Number(this.filters.catId);

  // 2. Filter master list based on categoryId
  this.filteredSubCategories = this.subCategories.filter(s => {
    // Backend check: is it s.categoryId or s.category.id?
    const catId = s.categoryId || s.category?.id;
    return Number(catId) === selectedCatId;
  });
  
  console.log('Filtered Sub-Categories:', this.filteredSubCategories);
}

  loadTaxonomy() {
    this.isLoading = true;
    this.taxonomySubscriptions.push(
      this.productService.getTypes().subscribe((data) => (this.types = data)),
      this.productService
        .getCategories()
        .subscribe((data) => {this.categories = data; this.filterCategories();}),
      this.productService
        .getSubCategories()
        .subscribe((data) => {this.subCategories = data;this.filterSubCategories();}),
    );
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }
  loadProducts(): void {
    this.isLoading = true; // Show spinner and hide content

    this.productService.getProducts(this.filters).subscribe({
      next: (res) => {
        this.products = res.items;
        this.totalItems = res.total;

        // Timeout to ensure smooth transition
        setTimeout(() => {
          this.isLoading = false;
        }, 600);
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.isLoading = false;
      },
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
    console.warn(
      'Image failed to load, switching to placeholder:',
      event.target.src,
    );
    // Use the absolute path to your placeholder
    event.target.src =
      'http://localhost:4000/ProductImages/default-placeholder.png';
  }


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

  // Called when Category changes
  
}



