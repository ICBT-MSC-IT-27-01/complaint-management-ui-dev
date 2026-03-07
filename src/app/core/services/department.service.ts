import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ApiResponse, PagedResult } from '@core/models/api-response.model';
import {
  Department,
  DepartmentSearchRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '@core/models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/departments`;

  search(req: DepartmentSearchRequest): Observable<ApiResponse<PagedResult<Department>>> {
    let params = new HttpParams();
    if (req.q != null) params = params.set('Q', String(req.q));
    if (req.isActive != null) params = params.set('IsActive', String(req.isActive));
    if (req.page != null) params = params.set('Page', String(req.page));
    if (req.pageSize != null) params = params.set('PageSize', String(req.pageSize));

    return this.http.get<ApiResponse<unknown>>(this.base, { params }).pipe(
      map((res) => ({ ...res, data: this.normalizePagedResult(res.data) }))
    );
  }

  getById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<unknown>>(`${this.base}/${id}`).pipe(
      map((res) => ({ ...res, data: this.normalizeDepartment(res.data) }))
    );
  }

  typeahead(q: string): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<unknown>>(`${this.base}/search`, { params: { q } }).pipe(
      map((res) => ({ ...res, data: this.normalizeDepartmentArray(res.data) }))
    );
  }

  create(req: CreateDepartmentRequest): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<unknown>>(this.base, req).pipe(
      map((res) => ({ ...res, data: this.normalizeDepartment(res.data) }))
    );
  }

  update(id: number, req: UpdateDepartmentRequest): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${this.base}/${id}`, req);
  }

  delete(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/${id}`);
  }

  private normalizePagedResult(value: unknown): PagedResult<Department> {
    const data = (value ?? {}) as Record<string, unknown>;
    const items = this.normalizeDepartmentArray(data['items'] ?? data['Items']);
    const page = Number(data['page'] ?? data['Page'] ?? 1);
    const rawPageSize = data['pageSize'] ?? data['PageSize'] ?? items.length ?? 20;
    const pageSize = Number(rawPageSize || 20);
    const totalCount = Number(data['totalCount'] ?? data['TotalCount'] ?? items.length);
    const totalPages = Number(
      data['totalPages'] ??
      data['TotalPages'] ??
      (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0)
    );

    return { page, pageSize, totalCount, totalPages, items };
  }

  private normalizeDepartmentArray(value: unknown): Department[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.normalizeDepartment(item));
  }

  private normalizeDepartment(value: unknown): Department {
    const item = (value ?? {}) as Record<string, unknown>;
    return {
      Id: Number(item['Id'] ?? item['id'] ?? 0),
      DepartmentCode: String(item['DepartmentCode'] ?? item['departmentCode'] ?? ''),
      Name: String(item['Name'] ?? item['name'] ?? ''),
      Description: String(item['Description'] ?? item['description'] ?? ''),
      SortOrder: Number(item['SortOrder'] ?? item['sortOrder'] ?? 0),
      IsActive: Boolean(item['IsActive'] ?? item['isActive'] ?? false),
      CreatedDateTime: String(item['CreatedDateTime'] ?? item['createdDateTime'] ?? '')
    };
  }
}
