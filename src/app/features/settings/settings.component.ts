import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountSession } from '@core/models/account.model';
import { AccountService } from '@core/services/account.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase, NgFor, NgIf, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Account Settings</h2>
        <p class="page-sub">Manage profile, notifications, security protocols, and system preferences.</p>
      </div>
      <div class="d-flex gap-2">
        <a routerLink="/theme-preview" class="btn btn-outline-primary btn-size-md">Theme Preview</a>
        <button class="btn btn-primary btn-size-md">Save Changes</button>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='profile'}" (click)="tab.set('profile')">Profile</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='notifications'}" (click)="tab.set('notifications')">Notifications</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='security'}" (click)="tab.set('security')">Security</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab()==='preferences'}" (click)="tab.set('preferences')">System Preferences</button></li>
    </ul>

    <div class="card cms-card">
      <div class="card-body" [ngSwitch]="tab()">
        <div *ngSwitchCase="'profile'">
          <h6 class="fw-bold">Profile Information</h6>
          <p class="text-muted">Update your photo and personal details.</p>
          <div class="row g-3 mt-1">
            <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" value="Alex Rivera"></div>
            <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" value="alex@complimate.com"></div>
            <div class="col-md-6"><label class="form-label">Job Title</label><input class="form-control" value="Compliance Officer"></div>
            <div class="col-md-6"><label class="form-label">Department</label><input class="form-control" value="Legal & Compliance"></div>
          </div>
        </div>
        <div *ngSwitchCase="'notifications'">
          <h6 class="fw-bold">Notification Rules</h6>
          <div class="form-check form-switch mt-3"><input class="form-check-input" type="checkbox" checked><label class="form-check-label">SLA breach alerts</label></div>
          <div class="form-check form-switch mt-2"><input class="form-check-input" type="checkbox" checked><label class="form-check-label">Daily summary email</label></div>
        </div>
        <div *ngSwitchCase="'security'">
          <h6 class="fw-bold">Security Controls</h6>
          <div class="row g-3 mt-1">
            <div class="col-md-6"><label class="form-label">Session Timeout</label><select class="form-select"><option>30 minutes</option><option>1 hour</option></select></div>
            <div class="col-md-6">
              <label class="form-label">MFA Verification Code</label>
              <div class="input-group">
                <input class="form-control" [(ngModel)]="twoFactorCode" placeholder="Enter code" />
                <button class="btn btn-outline-primary" (click)="enableTwoFactor()">Enable</button>
              </div>
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-outline-primary" (click)="setupTwoFactor()">Setup 2FA</button>
            <button class="btn btn-outline-danger" (click)="deactivateAccount()">Deactivate Account</button>
          </div>
          <small class="text-muted d-block mt-2" *ngIf="twoFactorSetupSecret()">2FA Secret: {{ twoFactorSetupSecret() }}</small>
          <small class="text-muted d-block mt-1" *ngIf="twoFactorSetupQrUri()">QR URI: {{ twoFactorSetupQrUri() }}</small>
          <small class="text-muted d-block mt-1" *ngIf="twoFactorDemoCode()">Demo Verification Code: {{ twoFactorDemoCode() }}</small>
          <small class="text-success d-block mt-2" *ngIf="successMsg">{{ successMsg }}</small>
        </div>
        <div *ngSwitchCase="'preferences'">
          <h6 class="fw-bold">System Preferences</h6>
          <p class="text-muted mb-3">Loaded from Account API: active sessions and session controls.</p>
          <div class="mt-4">
            <h6 class="fw-bold">Active Sessions</h6>
            <div class="table-responsive border rounded mt-2">
              <table class="table mb-0">
                <thead><tr><th>Session ID</th><th>Device</th><th>Issued</th><th>Last Seen</th><th>Expires</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let s of sessions()">
                    <td><code>{{ sessionId(s) }}</code></td>
                    <td>{{ sessionDevice(s) }}</td>
                    <td>{{ sessionIssuedAt(s) }}</td>
                    <td>{{ sessionLastActive(s) }}</td>
                    <td>{{ sessionExpiresAt(s) }}</td>
                    <td>
                      <span class="badge" [class]="sessionIsActive(s) ? 'bg-success' : 'bg-secondary'">
                        {{ sessionIsActive(s) ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" (click)="revokeSession(sessionId(s))" [disabled]="!sessionId(s)">Revoke</button>
                    </td>
                  </tr>
                  <tr *ngIf="!sessions().length">
                    <td colspan="7" class="text-center text-muted py-3">No active sessions found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private accountService = inject(AccountService);

  tab = signal<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  sessions = signal<AccountSession[]>([]);
  twoFactorSetupSecret = signal('');
  twoFactorSetupQrUri = signal('');
  twoFactorDemoCode = signal('');
  twoFactorCode = '';
  successMsg = '';

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.accountService.getSessions().subscribe({
      next: (res) => {
        const parsed = this.parseResponse<AccountSession[]>(res);
        if (parsed.ok) this.sessions.set(parsed.data ?? []);
      }
    });
  }

  revokeSession(sessionId: string): void {
    if (!sessionId) return;
    this.accountService.revokeSession(sessionId).subscribe({
      next: () => this.loadSessions()
    });
  }

  setupTwoFactor(): void {
    this.accountService.setupTwoFactor().subscribe({
      next: (res) => {
        const parsed = this.parseResponse<Record<string, unknown>>(res);
        if (!parsed.ok || !parsed.data) return;
        const data = parsed.data;
        this.twoFactorSetupSecret.set(String(data['secret'] ?? data['Secret'] ?? data['manualEntryKey'] ?? ''));
        this.twoFactorSetupQrUri.set(String(data['qrCodeUri'] ?? data['QrCodeUri'] ?? data['qrCodeUrl'] ?? ''));
        this.twoFactorDemoCode.set(String(data['demoVerificationCode'] ?? data['DemoVerificationCode'] ?? ''));
      }
    });
  }

  enableTwoFactor(): void {
    const code = this.twoFactorCode.trim();
    if (!code) return;
    this.accountService.enableTwoFactor({ verificationCode: code }).subscribe({
      next: (res) => {
        const parsed = this.parseResponse<object>(res);
        if (parsed.ok) this.successMsg = '2FA enabled successfully.';
      }
    });
  }

  deactivateAccount(): void {
    this.accountService.deactivateAccount().subscribe({
      next: (res) => {
        const parsed = this.parseResponse<object>(res);
        if (parsed.ok) this.successMsg = 'Account deactivation request submitted.';
      }
    });
  }

  sessionId(session: AccountSession): string {
    const item = session as AccountSession & { SessionId?: string };
    return session.sessionId ?? item.SessionId ?? '';
  }

  sessionDevice(session: AccountSession): string {
    const item = session as AccountSession & { DeviceId?: string; Device?: string };
    return session.deviceId ?? session.device ?? item.DeviceId ?? item.Device ?? '-';
  }

  sessionIssuedAt(session: AccountSession): string {
    const item = session as AccountSession & { IssuedAtUtc?: string };
    const value = session.issuedAtUtc ?? item.IssuedAtUtc;
    return this.formatDate(value);
  }

  sessionLastActive(session: AccountSession): string {
    const item = session as AccountSession & { LastSeenAtUtc?: string; LastActiveAt?: string };
    const value = session.lastSeenAtUtc ?? session.lastActiveAt ?? item.LastSeenAtUtc ?? item.LastActiveAt;
    return this.formatDate(value);
  }

  sessionExpiresAt(session: AccountSession): string {
    const item = session as AccountSession & { ExpiresAtUtc?: string };
    const value = session.expiresAtUtc ?? item.ExpiresAtUtc;
    return this.formatDate(value);
  }

  sessionIsActive(session: AccountSession): boolean {
    const item = session as AccountSession & { IsActive?: boolean };
    return session.isActive ?? item.IsActive ?? false;
  }

  private formatDate(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  private parseResponse<T>(response: unknown): { ok: boolean; data: T | null } {
    const item = response as {
      isSuccess?: boolean;
      IsSuccess?: boolean;
      data?: T;
      Data?: T;
    };
    return {
      ok: (item.isSuccess ?? item.IsSuccess) === true,
      data: (item.data ?? item.Data ?? null) as T | null
    };
  }
}
