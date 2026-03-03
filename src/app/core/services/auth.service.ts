import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { LoginRequest, LoginResponse, AuthUser, CheckEmailRequest, ClientRegisterRequest, ClientEmailCheckResponse } from '@core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authBase = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'cms_token';
  private readonly USER_KEY = 'cms_user';

  currentUser = signal<AuthUser | null>(this.loadUser());

  login(req: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.authBase}/login`, req).pipe(
      tap(res => {
        if (res.isSuccess) this.persistSession(res.data);
      })
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    const payload: CheckEmailRequest = { EmailOrUsername: email, Password: '' };

    return this.http.post<ApiResponse<ClientEmailCheckResponse>>(`${this.authBase}/login`, payload).pipe(
      map(res => this.readEmailExists(res.data as unknown))
    );
  }

  registerClient(req: ClientRegisterRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.authBase}/client/register`, req).pipe(
      tap(res => {
        if (res.isSuccess) this.persistSession(res.data);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  private loadUser(): AuthUser | null {
    try {
      const json = localStorage.getItem(this.USER_KEY);
      return json ? JSON.parse(json) : null;
    } catch { return null; }
  }

  private persistSession(raw: unknown): void {
    const data = (raw ?? {}) as Partial<LoginResponse> & Record<string, unknown>;
    const userId = Number(data.userId ?? data['UserId'] ?? 0);
    const email = String(data.email ?? data['Email'] ?? '');
    const username = String(data.username ?? data['Username'] ?? '');
    const fullName = String(data.fullName ?? data['FullName'] ?? '');
    const role = String(data.role ?? data['Role'] ?? '');
    const accessToken = String(data.accessToken ?? data['AccessToken'] ?? '');

    if (!accessToken) return;

    const user: AuthUser = {
      userId,
      email,
      username,
      fullName,
      role: (role || 'Client') as AuthUser['role'],
      accessToken
    };

    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readEmailExists(raw: unknown): boolean {
    if (typeof raw === 'boolean') return raw;
    if (!raw || typeof raw !== 'object') return false;

    const data = raw as Record<string, unknown>;
    const values = [
      data['exists'],
      data['Exists'],
      data['emailExists'],
      data['EmailExists'],
      data['requiresPassword'],
      data['RequiresPassword'],
      data['requiresRegistration'],
      data['RequiresRegistration'],
      data['isExistingUser'],
      data['IsExistingUser']
    ];

    const found = values.find(v => typeof v === 'boolean');
    return typeof found === 'boolean' ? found : false;
  }
}
