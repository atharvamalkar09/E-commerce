import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductListResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:4000/api/products';
  private baseUrl = 'http://localhost:4000/api/taxonomy'; // Base URL for other resources

  constructor(private http: HttpClient) {}

  getProducts(filters: any = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice);

    // Requirement 8.3: Pass specific IDs
    if (filters.typeId) params = params.set('typeId', filters.typeId);
    if (filters.catId) params = params.set('catId', filters.catId);
    if (filters.subCatId) params = params.set('subCatId', filters.subCatId);

    params = params.set('page', filters.page.toString());
    params = params.set('limit', filters.limit.toString());

    return this.http.get<ProductListResponse>(this.apiUrl, { params });

    // let params = new HttpParams();
    // if (filters.search) params = params.set('search', filters.search);
    // if (filters.minPrice)
    //   params = params.set('minPrice', filters.minPrice.toString());
    // if (filters.maxPrice)
    //   params = params.set('maxPrice', filters.maxPrice.toString());
    // if (filters.subCatId)
    //   params = params.set('subCatId', filters.subCatId.toString());
    // if (filters.page) params = params.set('page', filters.page.toString());
    // if (filters.limit) params = params.set('limit', filters.limit.toString());
    // return this.http.get<ProductListResponse>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: number, data: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // --- NEW: Methods to fetch Taxonomy Data ---
  getTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/types`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`);
  }

  getSubCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subcategories`);
  }

  // --- Taxonomy CRUD (Fixed URLs) ---
  addTaxonomy(data: { level: string; name: string; parentId?: number }) {
    return this.http.post(`${this.baseUrl}`, data);
  }

  deleteTaxonomy(level: string, id: number) {
    return this.http.delete(`${this.baseUrl}/${level}/${id}`);
  }

  updateTaxonomy(level: string, id: number, name: string) {
    return this.http.put(`${this.baseUrl}/${level}/${id}`, { name });
  }
}

// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { Product, ProductListResponse } from '../models/product.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class ProductService {
//   private apiUrl = 'http://localhost:4000/api/products';

//   constructor(private http: HttpClient) {}

//   /**
//    * Fetches products with optional filtering and pagination
//    */
//   getProducts(filters: any = {}): Observable<ProductListResponse> {
//     let params = new HttpParams();

//     // Map frontend filters to backend query keys
//     if (filters.search) params = params.set('search', filters.search);
//     if (filters.minPrice)
//       params = params.set('minPrice', filters.minPrice.toString());
//     if (filters.maxPrice)
//       params = params.set('maxPrice', filters.maxPrice.toString());
//     if (filters.subCatId)
//       params = params.set('subCatId', filters.subCatId.toString());
//     if (filters.page) params = params.set('page', filters.page.toString());
//     if (filters.limit) params = params.set('limit', filters.limit.toString());

//     return this.http.get<ProductListResponse>(this.apiUrl, { params });
//   }

//   getProductById(id: number): Observable<Product> {
//     return this.http.get<Product>(`${this.apiUrl}/${id}`);
//   }

//   updateProduct(id: number, data: FormData): Observable<Product> {
//     // If your apiURL already includes '/api/products', just add the ID
//     return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
//   }

//   deleteProduct(id: number): Observable<any> {
//     // Use ONLY the id, because apiURL already contains the /api/products path
//     return this.http.delete(`${this.apiUrl}/${id}`);
//   }
//   addTaxonomy(data: { level: string; name: string; parentId?: number }) {
//     return this.http.post(`${this.apiUrl}/api/taxonomy`, data);
//   }

//   deleteTaxonomy(level: string, id: number) {
//     return this.http.delete(`${this.apiUrl}/api/taxonomy/${level}/${id}`);
//   }

//   updateTaxonomy(level: string, id: number, name: string) {
//     return this.http.put(`${this.apiUrl}/api/taxonomy/${level}/${id}`, {
//       name,
//     });
//   }
// }
