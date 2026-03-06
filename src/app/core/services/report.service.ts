import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { DashboardData, ReportFilterRequest, ComplaintsSummaryReport } from '@core/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${environment.apiUrl}/reports/dashboard`);
  }

  getComplaintSummary(req: ReportFilterRequest): Observable<ApiResponse<ComplaintsSummaryReport>> {
    let params = new HttpParams();
    Object.entries(req).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<ApiResponse<ComplaintsSummaryReport>>(`${environment.apiUrl}/reports/complaints-summary`, { params });
  }

  getHighPriorityOverdue(req: ReportFilterRequest): Observable<ApiResponse<object[]>> {
    let params = new HttpParams();
    Object.entries(req).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<ApiResponse<object[]>>(`${environment.apiUrl}/reports/high-priority-overdue`, { params });
  }

  exportComplaintSummaryPdf(req: ReportFilterRequest): Observable<Blob> {
    let params = new HttpParams();
    Object.entries(req).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get(`${environment.apiUrl}/reports/complaints-summary/export/pdf`, { params, responseType: 'blob' });
  }
}
