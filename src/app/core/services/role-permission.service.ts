import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { PermissionAuditItem, RolePermissionsPayload } from '@core/models/role-permission.model';

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/role-permissions`;

  getByRole(role: string): Observable<ApiResponse<RolePermissionsPayload>> {
    return this.http.get<ApiResponse<RolePermissionsPayload>>(`${this.base}/${encodeURIComponent(role)}`);
  }

  save(payload: RolePermissionsPayload): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/save`, payload);
  }

  duplicate(role: string, newRole: string): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${this.base}/${encodeURIComponent(role)}/duplicate/${encodeURIComponent(newRole)}`,
      {}
    );
  }

  getAuditTrail(): Observable<ApiResponse<PermissionAuditItem[]>> {
    return this.http.get<ApiResponse<PermissionAuditItem[]>>(`${this.base}/audit-trail`);
  }
}
