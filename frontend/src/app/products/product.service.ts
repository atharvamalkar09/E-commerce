import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductListResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:4000/api/products';
  private baseUrl = 'http://localhost:4000/api/taxonomy';

  constructor(private http: HttpClient) {}

  getProducts(filters: any = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    
    if (filters.search){
      params = params.set('search', filters.search);
    }
    if (filters.minPrice) {
      params = params.set('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      params = params.set('maxPrice', filters.maxPrice);
    }

    if (filters.typeId) {
      params = params.set('typeId', filters.typeId);
    }
    if (filters.catId) {
      params = params.set('catId', filters.catId);
    }
    if (filters.subCatId) {
      params = params.set('subCatId', filters.subCatId);
    }

    params = params.set('page', filters.page.toString());
    params = params.set('limit', filters.limit.toString());

    return this.http.get<ProductListResponse>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: number, data: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteTaxonomy(level: 'type' | 'category' | 'subcategory', id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/taxonomy/${level}/${id}`);
}

  getTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/types`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`);
  }

  getSubCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subcategories`);
  }

  addTaxonomy(data: { level: string; name: string; parentId?: number }) {
    return this.http.post(`${this.baseUrl}`, data);
  }

  updateTaxonomy(level: string, id: number, name: string) {
    return this.http.put(`${this.baseUrl}/${level}/${id}`, { name });
  }
}

