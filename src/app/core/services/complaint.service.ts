import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PagedResult } from '@core/models/api-response.model';
import { Complaint, CreateComplaintRequest, ComplaintSearchRequest, AssignComplaintRequest, EscalateComplaintRequest, ResolveComplaintRequest, UpdateStatusRequest, ComplaintHistory } from '@core/models/complaint.model';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/complaints`;

  search(req: ComplaintSearchRequest): Observable<ApiResponse<PagedResult<Complaint>>> {
    let params = new HttpParams();
    Object.entries(req).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<ApiResponse<PagedResult<Complaint>>>(this.base, { params });
  }

  getById(id: number): Observable<ApiResponse<Complaint>> {
    return this.http.get<ApiResponse<Complaint>>(`${this.base}/${id}`);
  }

  getHistory(id: number): Observable<ApiResponse<ComplaintHistory[]>> {
    return this.http.get<ApiResponse<ComplaintHistory[]>>(`${this.base}/${id}/history`);
  }

  create(req: CreateComplaintRequest): Observable<ApiResponse<Complaint>> {
    return this.http.post<ApiResponse<Complaint>>(this.base, req);
  }

  updateStatus(id: number, req: UpdateStatusRequest): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(`${this.base}/${id}/status`, req);
  }

  assign(id: number, req: AssignComplaintRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/${id}/assign`, req);
  }

  escalate(id: number, req: EscalateComplaintRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/${id}/escalate`, req);
  }

  resolve(id: number, req: ResolveComplaintRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/${id}/resolve`, req);
  }

  close(id: number): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/${id}/close`, {});
  }

  delete(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/${id}`);
  }
}
