import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountSession } from '@core/models/account.model';
import { AccountService } from '@core/services/account.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase, NgFor, NgIf, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Account Settings</h2>
        <p class="page-sub">Manage profile, notifications, security protocols, and system preferences.</p>
      </div>
      <button class="btn btn-primary">Save Changes</button>
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
          <small class="text-success d-block mt-2" *ngIf="successMsg">{{ successMsg }}</small>
        </div>
        <div *ngSwitchCase="'preferences'">
          <h6 class="fw-bold">System Preferences</h6>
          <div class="row g-3 mt-1">
            <div class="col-md-6"><label class="form-label">Timezone</label><select class="form-select"><option>UTC-08:00 Pacific</option></select></div>
            <div class="col-md-6"><label class="form-label">Date Format</label><select class="form-select"><option>MMM dd, yyyy</option></select></div>
          </div>

          <div class="mt-4">
            <h6 class="fw-bold">Active Sessions</h6>
            <div class="table-responsive border rounded mt-2">
              <table class="table mb-0">
                <thead><tr><th>Session ID</th><th>Device</th><th>IP</th><th>Last Active</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let s of sessions()">
                    <td><code>{{ sessionId(s) }}</code></td>
                    <td>{{ sessionDevice(s) }}</td>
                    <td>{{ sessionIp(s) }}</td>
                    <td>{{ sessionLastActive(s) }}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" (click)="revokeSession(sessionId(s))" [disabled]="!sessionId(s)">Revoke</button>
                    </td>
                  </tr>
                  <tr *ngIf="!sessions().length">
                    <td colspan="5" class="text-center text-muted py-3">No active sessions found.</td>
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
  twoFactorCode = '';
  successMsg = '';

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.accountService.getSessions().subscribe({
      next: (res) => {
        if (res.isSuccess) this.sessions.set(res.data ?? []);
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
        if (!res.isSuccess) return;
        this.twoFactorSetupSecret.set(res.data.secret ?? res.data.manualEntryKey ?? '');
      }
    });
  }

  enableTwoFactor(): void {
    const code = this.twoFactorCode.trim();
    if (!code) return;
    this.accountService.enableTwoFactor({ code }).subscribe({
      next: (res) => {
        if (res.isSuccess) this.successMsg = '2FA enabled successfully.';
      }
    });
  }

  deactivateAccount(): void {
    this.accountService.deactivateAccount().subscribe({
      next: (res) => {
        if (res.isSuccess) this.successMsg = 'Account deactivation request submitted.';
      }
    });
  }

  sessionId(session: AccountSession): string {
    const item = session as AccountSession & { SessionId?: string };
    return session.sessionId ?? item.SessionId ?? '';
  }

  sessionDevice(session: AccountSession): string {
    const item = session as AccountSession & { Device?: string };
    return session.device ?? item.Device ?? '-';
  }

  sessionIp(session: AccountSession): string {
    const item = session as AccountSession & { IpAddress?: string };
    return session.ipAddress ?? item.IpAddress ?? '-';
  }

  sessionLastActive(session: AccountSession): string {
    const item = session as AccountSession & { LastActiveAt?: string };
    return session.lastActiveAt ?? item.LastActiveAt ?? '-';
  }
}
