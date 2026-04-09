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

  // UI States
  isLoading = false;
  showConfirm = false;
  confirmMessage = '';
  
  // Storage for deletion info
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
    // Using forkJoin or sequential loading? 
    // For simplicity, we'll turn off loader once categories are in
    this.productService.getTypes().subscribe(res => this.types = res);
    this.productService.getCategories().subscribe(res => this.categories = res);
    this.productService.getSubCategories().subscribe(res => {
      this.subCategories = res;
      setTimeout(() => this.isLoading = false, 600); // Clean pop-in
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
        this.loadInitialData(); // This will trigger the loader again
      },
      error: (err) => {
        console.error('Upload Error:', err);
        this.isLoading = false;
        alert(err.error?.message || 'Failed to add product');
      },
    });
  }

  // --- Modal Logic ---
  deleteTaxonomy(level: string, id: number) {
    this.pendingDeletion = { level, id };
    this.confirmMessage = `Are you sure? This will delete this ${level} and EVERYTHING under it (Cascade).`;
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
    this.http.delete(`http://localhost:4000/api/taxonomy/${level}/${id}`).subscribe({
      next: () => {
        this.loadInitialData();
      },
      error: (err) => {
        this.isLoading = false;
        alert('Delete failed: ' + err.error.message);
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











// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Component, inject, OnInit } from '@angular/core';
// import { ProductService } from '../../products/product.service';

// @Component({
//   selector: 'app-product-management',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './product-management.component.html',
//   styleUrl: './product-management.component.css',
// })
// export class ProductManagementComponent implements OnInit {
//   private http = inject(HttpClient);
//   constructor(private productService: ProductService) {}

//   // Lists for the dropdown suggestions
//   types: any[] = [];
//   categories: any[] = [];
//   subCategories: any[] = [];

//   // Data model uses strings now
//   product = {
//     name: '',
//     description: '',
//     price: 0,
//     stock: 0,
//     typeName: '',
//     categoryName: '',
//     subCategoryName: ''
//   };

//   selectedFile: File | null = null;

//   ngOnInit() {
//     this.loadInitialData();
//   }

//   loadInitialData() {
//     // Fetch existing names to show as suggestions in the datalists
//     this.productService.getTypes().subscribe(res => this.types = res);
//     this.productService.getCategories().subscribe(res => this.categories = res);
//     this.productService.getSubCategories().subscribe(res => this.subCategories = res);
//   }

//   onFileSelected(event: any) {
//     this.selectedFile = event.target.files[0];
//   }

//   submitProduct() {
//     const fd = new FormData();
//     fd.append('name', this.product.name);
//     fd.append('description', this.product.description);
//     fd.append('price', this.product.price.toString());
//     fd.append('stockQuantity', this.product.stock.toString());

//     // Send the NAMES to the backend
//     fd.append('typeName', this.product.typeName);
//     fd.append('categoryName', this.product.categoryName);
//     fd.append('subCategoryName', this.product.subCategoryName);

//     if (this.selectedFile) {
//       fd.append('image', this.selectedFile);
//     }

//     this.http.post('http://localhost:4000/api/products', fd).subscribe({
//       next: () => {
//         alert('Product added/updated successfully!');
//         this.resetForm();
//         this.loadInitialData(); // Refresh lists with any new names created
//       },
//       error: (err) => {
//         console.error('Upload Error:', err);
//         alert(err.error?.message || 'Failed to add product');
//       },
//     });
//   }

//   deleteTaxonomy(level: string, id: number) {
//   if (confirm(`Are you sure? This will delete this ${level} and EVERYTHING under it (Cascade).`)) {
//     this.http.delete(`http://localhost:4000/api/taxonomy/${level}/${id}`).subscribe({
//       next: () => {
//         alert(`${level} deleted!`);
//         this.loadInitialData(); // Refresh dropdown suggestions
//       },
//       error: (err) => alert('Delete failed: ' + err.error.message)
//     });
//   }
// }

//   resetForm() {
//     this.product = {
//       name: '',
//       description: '',
//       price: 0,
//       stock: 0,
//       typeName: '',
//       categoryName: '',
//       subCategoryName: ''
//     };
//     this.selectedFile = null;
//   }
// }















// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Component, inject, OnInit } from '@angular/core';
// import { ProductService } from '../../products/product.service';

// @Component({
//   selector: 'app-product-management',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './product-management.component.html',
//   styleUrl: './product-management.component.css',
// })
// export class ProductManagementComponent implements OnInit { 
//   private http = inject(HttpClient);

//   constructor(private productService: ProductService){}

//   types: any[] = [];
//   categories: any[] = [];
//   allCategories: any[] = [];
//   subCategories: any[] = [];

//   product = {
//     name: '',
//     description: '',
//     price: 0,
//     stock: 0,
//     typeId: null as number | null,
//     categoryId: null as number | null,
//     subCategoryId: null as number | null
//   };
  
//   selectedFile: File | null = null;

//   loadInitialData(): void {
//     this.productService.getTypes().subscribe(res => this.types = res);
//     this.productService.getCategories().subscribe(res => this.allCategories = res);
//     this.productService.getSubCategories().subscribe(res => this.subCategories = res);
//   }


//   // 2. Load the first dropdown on page load
//   ngOnInit() {
//     this.http.get<any[]>('http://localhost:4000/api/products/types')
//       .subscribe(data => this.types = data);
//   }

//   onTypeChange() {
//     if (this.product.typeId) {
//       this.http
//         .get<any[]>(`http://localhost:4000/api/products/categories/${this.product.typeId}`)
//         .subscribe((data) => {
//           this.categories = data;
//           this.subCategories = []; // Clear subcats if type changes
//           this.product.categoryId = null;
//           this.product.subCategoryId = null;
//         });
//     }
//   }

//   onCategoryChange() {
//     if (this.product.categoryId) {
//       this.http
//         .get<any[]>(`http://localhost:4000/api/products/subcategories/${this.product.categoryId}`)
//         .subscribe((data) => {
//           this.subCategories = data;
//           this.product.subCategoryId = null;
//         });
//     }
//   }

//   onFileSelected(event: any) {
//     this.selectedFile = event.target.files[0];
//   }

//   submitProduct() {
//     const fd = new FormData();
//     fd.append('name', this.product.name);
//     fd.append('description', this.product.description);
//     fd.append('price', this.product.price.toString());
//     fd.append('stockQuantity', this.product.stock.toString());

//     // 3. The Fix for the "Object is possibly null" error
//     // Use optional chaining (?) or a fallback empty string
//     fd.append('subCategoryId', this.product.subCategoryId?.toString() || '');

//     if (this.selectedFile) {
//       fd.append('image', this.selectedFile);
//     }

//     this.http.post('http://localhost:4000/api/products', fd).subscribe({
//       next: () => {
//         alert('Product Added Successfully!');
//         this.resetForm();
//       },
//       error: (err) => {
//         console.error('Upload Error:', err);
//         alert('Failed to add product. Check console.');
//       },
//     });
//   }

//   resetForm() {
//     this.product = {
//       name: '',
//       description: '',
//       price: 0,
//       stock: 0,
//       typeId: null,
//       categoryId: null,
//       subCategoryId: null
//     };
//     this.selectedFile = null;
//   }
//   submitTaxonomy(level: string, name: string, parentId?: number) {
//     if (!name) {
//       alert('Please enter a name');
//       return;
//     }
    
//     // Validate parentId when needed
//     if ((level === 'category' || level === 'subcategory') && !parentId) {
//       alert(`Please select a parent ${level === 'category' ? 'type' : 'category'}`);
//       return;
//     }
    
//     this.productService.addTaxonomy({ level, name, parentId }).subscribe({
//       next: (res) => {
//         alert(`${level} added successfully!`);
//         this.loadInitialData(); // Refresh all lists
//       },
//       error: (err) => {
//         console.error('Add Taxonomy Error:', err);
//         const errorMessage = err.error?.message || err.error?.error || 'Failed to add taxonomy item';
//         alert(`Error: ${errorMessage}`);
//       }
//     });
//   }

//   removeTaxonomy(level: string, id: number) {
//     if (confirm(`Are you sure you want to delete this ${level}? This action cannot be undone.`)) {
//       this.productService.deleteTaxonomy(level, id).subscribe({
//         next: () => {
//           console.log(`${level} removed`);
//           alert(`${level} deleted successfully`);
//           this.loadInitialData(); 
//         },
//         error: (err) => {
//           console.error('Delete failed', err);
//           const errorMessage = err.error?.message || err.error?.error || 'Failed to delete taxonomy item';
//           alert(`Error: ${errorMessage}`);
//         }
//       });
//     }
//   }
// }

