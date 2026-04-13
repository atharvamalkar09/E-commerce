import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../products/product.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, LoadingSpinnerComponent],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css',
})
export class ProductManagementComponent implements OnInit {
  private http = inject(HttpClient);
  constructor(private productService: ProductService) {}

  isLoading = false;
  showConfirm = false;
  confirmMessage = '';
  
  pendingDeletion: { level: string; id: number } | null = null;

  types: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];

  product = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    typeName: '',
    categoryName: '',
    subCategoryName: ''
  };

  selectedFile: File | null = null;

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;
    this.productService.getTypes().subscribe(res => this.types = res);
    this.productService.getCategories().subscribe(res => this.categories = res);
    this.productService.getSubCategories().subscribe(res => {
      this.subCategories = res;
      setTimeout(() => this.isLoading = false, 600);
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitProduct() {
    this.isLoading = true;
    const fd = new FormData();
    fd.append('name', this.product.name);
    fd.append('description', this.product.description);
    fd.append('price', this.product.price.toString());
    fd.append('stockQuantity', this.product.stock.toString());
    fd.append('typeName', this.product.typeName);
    fd.append('categoryName', this.product.categoryName);
    fd.append('subCategoryName', this.product.subCategoryName);

    if (this.selectedFile) {
      fd.append('image', this.selectedFile);
    }

    this.http.post('http://localhost:4000/api/products', fd).subscribe({
      next: () => {
        this.resetForm();
        this.loadInitialData();
      },
      error: (err) => {
        console.error('Upload Error:', err);
        this.isLoading = false;
        alert(err.error?.message || 'Failed to add product');
      },
    });
  }

  deleteTaxonomy(level: string, id: number) {
    this.pendingDeletion = { level, id };
    this.confirmMessage = `Are you sure, You want to delete this?`;
    this.showConfirm = true;
  }

  handleConfirmation(confirmed: boolean) {
    this.showConfirm = false;
    if (confirmed && this.pendingDeletion) {
      this.executeDelete(this.pendingDeletion.level, this.pendingDeletion.id);
    }
    this.pendingDeletion = null;
  }

private executeDelete(level: string, id: number) {
  this.isLoading = true;
  const url = `http://localhost:4000/api/admin/taxonomy/${level}/${id}`;
  
  this.http.delete(url).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      this.loadInitialData();
    },
    error: (err) => {
      this.isLoading = false;
      alert('Delete failed: ' + (err.error?.message || 'Unknown error'));
    }
  });
}
  resetForm() {
    this.product = {
      name: '', description: '', price: 0, stock: 0,
      typeName: '', categoryName: '', subCategoryName: ''
    };
    this.selectedFile = null;
  }
}
