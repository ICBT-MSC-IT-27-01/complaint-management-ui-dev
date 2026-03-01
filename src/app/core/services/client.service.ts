import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PagedResult } from '@core/models/api-response.model';
import { Client, CreateClientRequest, ClientSearchRequest } from '@core/models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/clients`;

  search(req: ClientSearchRequest): Observable<ApiResponse<PagedResult<Client>>> {
    let params = new HttpParams();
    Object.entries(req).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<ApiResponse<PagedResult<Client>>>(this.base, { params });
  }

  getById(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.base}/${id}`);
  }

  typeahead(q: string): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(`${this.base}/search`, { params: { q } });
  }

  create(req: CreateClientRequest): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.base, req);
  }

  update(id: number, req: CreateClientRequest): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(`${this.base}/${id}`, req);
  }

  delete(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/${id}`);
  }
}
