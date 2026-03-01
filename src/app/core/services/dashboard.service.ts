import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope.model';

export interface DashboardMetrics {
  totalOpen: number;
  unassigned: number;
  highPriority: number;
  resolvedToday: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  metrics(): Observable<DashboardMetrics> {
    return this.http.get<ApiEnvelope<DashboardMetrics>>(`${environment.apiUrl}/reports/dashboard`).pipe(map((res) => res.data));
  }
}
