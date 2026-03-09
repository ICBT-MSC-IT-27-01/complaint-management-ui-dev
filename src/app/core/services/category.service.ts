import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { Category, CreateCategoryRequest, CreateParentCategoryRequest, SlaPolicy, CreateSlaPolicyRequest } from '@core/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`);
  }

  getById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${environment.apiUrl}/categories/${id}`);
  }

  getParents(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories/parents`);
  }

  createParent(req: CreateParentCategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${environment.apiUrl}/categories/parents`, req);
  }

  create(req: CreateCategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${environment.apiUrl}/categories`, req);
  }

  update(id: number, req: CreateCategoryRequest): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${environment.apiUrl}/categories/${id}`, req);
  }

  deactivate(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${environment.apiUrl}/categories/${id}`);
  }

  getAllSla(): Observable<ApiResponse<SlaPolicy[]>> {
    return this.http.get<ApiResponse<SlaPolicy[]>>(`${environment.apiUrl}/sla-policies`);
  }

  createSla(req: CreateSlaPolicyRequest): Observable<ApiResponse<SlaPolicy>> {
    return this.http.post<ApiResponse<SlaPolicy>>(`${environment.apiUrl}/sla-policies`, req);
  }

  updateSla(id: number, req: CreateSlaPolicyRequest): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${environment.apiUrl}/sla-policies/${id}`, req);
  }
}
