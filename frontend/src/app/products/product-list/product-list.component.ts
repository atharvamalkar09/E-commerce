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
  styleUrl: './product-list.component.css',
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

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private taxonomySubscriptions: Subscription[] = [];

  filters = {
    search: '',
    minPrice: '',
    maxPrice: '',
    typeId: '',
    catId: '', 
    subCatId: '',
    page: 1,
    limit: 10,
  };

  public apiUrl = 'http://localhost:4000';

  constructor(
    private productService: ProductService,
    public authService: AuthService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadTaxonomy();

    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        this.filters.search = value;
        this.filters.page = 1;
        this.loadProducts();
      });
  }

  filterCategories() {
  if (!this.filters.typeId) {
    this.filteredCategories = []; 
    return;
  }

  const selectedTypeId = Number(this.filters.typeId);

  this.filteredCategories = this.categories.filter(c => {
    const typeId = c.typeId || c.type?.id;
    return Number(typeId) === selectedTypeId;
  });

  console.log('Filtered Categories:', this.filteredCategories);
}

onTypeChange() {
  this.filters.catId = ''; 
  this.filterCategories();
  this.applyFilters();
}
onCategoryChange() {
    this.filters.subCatId = '';
    this.filterSubCategories();
    this.applyFilters();
  }

 filterSubCategories() {
  if (!this.filters.catId) {
    this.filteredSubCategories = [];
    return;
  }

  const selectedCatId = Number(this.filters.catId);

  this.filteredSubCategories = this.subCategories.filter(s => {
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
    this.isLoading = true;

    this.productService.getProducts(this.filters).subscribe({
      next: (res) => {
        this.products = res.items;
        this.totalItems = res.total;

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
    console.log('Adding to cart:', product.name);
  }
  applyFilters() {
    this.filters.page = 1;
    this.loadProducts();
  }

 getImageUrl(imagePath: string | null | undefined): string {

    if (!imagePath) {
      return `${this.apiUrl}/ProductImages/default-placeholder.png`;
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    if (imagePath.startsWith('ProductImages/')) {
      return `${this.apiUrl}/${imagePath}`;
    }

    return `${this.apiUrl}/ProductImages/${imagePath}`;
  }

  onImageError(event: any) {
    console.warn(
      'Image failed to load, switching to placeholder:',
      event.target.src,
    );
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
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

}



