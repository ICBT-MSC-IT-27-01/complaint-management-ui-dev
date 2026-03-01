import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { Case, CaseActivity, AddCaseActivityRequest, UpdateCaseStatusRequest } from '@core/models/case.model';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cases`;

  getById(id: number): Observable<ApiResponse<Case>> {
    return this.http.get<ApiResponse<Case>>(`${this.base}/${id}`);
  }

  getActivities(id: number): Observable<ApiResponse<CaseActivity[]>> {
    return this.http.get<ApiResponse<CaseActivity[]>>(`${this.base}/${id}/activities`);
  }

  addActivity(id: number, req: AddCaseActivityRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/${id}/activities`, req);
  }

  updateStatus(id: number, req: UpdateCaseStatusRequest): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(`${this.base}/${id}/status`, req);
  }
}
