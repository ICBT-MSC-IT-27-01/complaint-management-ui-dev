import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import {
  ApiRolePermissionItem,
  PermissionAuditItem,
  RoleItem,
  SaveRolePermissionsPayload
} from '@core/models/role-permission.model';

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/role-permissions`;

  getRoles(): Observable<ApiResponse<RoleItem[]>> {
    return this.http.get<ApiResponse<RoleItem[]>>(`${this.base}/roles`);
  }

  getByRole(role: string): Observable<ApiResponse<ApiRolePermissionItem[]>> {
    return this.http.get<ApiResponse<ApiRolePermissionItem[]>>(`${this.base}/${encodeURIComponent(role)}`);
  }

  save(payload: SaveRolePermissionsPayload): Observable<ApiResponse<object>> {
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
