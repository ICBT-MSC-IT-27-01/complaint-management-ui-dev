import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PagedResult } from '@core/models/api-response.model';
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamSearchRequest,
  AssignTeamMemberRequest
} from '@core/models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/teams`;

  search(req: TeamSearchRequest): Observable<ApiResponse<PagedResult<Team>>> {
    let params = new HttpParams();
    Object.entries(req).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ApiResponse<PagedResult<Team>>>(this.base, { params });
  }

  getById(id: number): Observable<ApiResponse<Team>> {
    return this.http.get<ApiResponse<Team>>(`${this.base}/${id}`);
  }

  create(req: CreateTeamRequest): Observable<ApiResponse<Team>> {
    return this.http.post<ApiResponse<Team>>(this.base, req);
  }

  update(id: number, req: UpdateTeamRequest): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${this.base}/${id}`, req);
  }

  addMember(id: number, req: AssignTeamMemberRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/${id}/members`, req);
  }

  removeMember(id: number, userId: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/${id}/members/${userId}`);
  }

  delete(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/${id}`);
  }
}
