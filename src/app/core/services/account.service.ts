import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { AccountSession, EnableTwoFactorRequest, TwoFactorSetupResponse } from '@core/models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/account`;

  getSessions(): Observable<ApiResponse<AccountSession[]>> {
    return this.http.get<ApiResponse<AccountSession[]>>(`${this.base}/sessions`);
  }

  revokeSession(sessionId: string): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/sessions/${encodeURIComponent(sessionId)}`);
  }

  setupTwoFactor(): Observable<ApiResponse<TwoFactorSetupResponse>> {
    return this.http.post<ApiResponse<TwoFactorSetupResponse>>(`${this.base}/2fa/setup`, {});
  }

  enableTwoFactor(req: EnableTwoFactorRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.base}/2fa/enable`, req);
  }

  deactivateAccount(): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.base}/deactivate`);
  }
}
