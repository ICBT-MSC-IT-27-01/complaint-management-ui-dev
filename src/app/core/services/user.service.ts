import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PagedResult } from '@core/models/api-response.model';
import { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, UserSearchRequest } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  search(req: UserSearchRequest): Observable<ApiResponse<PagedResult<User>>> {
    let params = new HttpParams();
    Object.entries(req).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<ApiResponse<PagedResult<User>>>(this.base, { params });
  }

  getById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/${id}`);
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/me`);
  }

  getAgents(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.base}/agents`);
  }

  create(req: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.base, req);
  }

  update(id: number, req: UpdateUserRequest): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${this.base}/${id}`, req);
  }

  changePassword(req: ChangePasswordRequest): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${this.base}/me/change-password`, req);
  }

  delete(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/${id}`);
  }

  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.base}/export/csv`, { responseType: 'blob' });
  }
}
