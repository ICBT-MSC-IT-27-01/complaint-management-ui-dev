import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { ChangePasswordRequest, User } from '@core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Account Settings</h2>
        <p class="page-sub">Manage your profile, security, and notification preferences.</p>
      </div>
      <button class="btn btn-primary">Save Changes</button>
    </div>

    <div class="profile-tabs-wrap mb-3">
      <ul class="profile-tabs" role="tablist" aria-label="Profile sections">
        <li class="profile-tabs__item">
          <button
            type="button"
            class="profile-tab"
            [ngClass]="{ 'profile-tab--active': tab==='profile' }"
            [attr.aria-selected]="tab==='profile'"
            (click)="tab='profile'">
            Profile
          </button>
        </li>
        <li class="profile-tabs__item">
          <button
            type="button"
            class="profile-tab"
            [ngClass]="{ 'profile-tab--active': tab==='notifications' }"
            [attr.aria-selected]="tab==='notifications'"
            (click)="tab='notifications'">
            Notifications
          </button>
        </li>
        <li class="profile-tabs__item">
          <button
            type="button"
            class="profile-tab"
            [ngClass]="{ 'profile-tab--active': tab==='security' }"
            [attr.aria-selected]="tab==='security'"
            (click)="tab='security'">
            Security
          </button>
        </li>
      </ul>
    </div>

    <div class="card cms-card" *ngIf="tab==='profile'">
      <div class="card-header"><h6 class="card-title mb-0">Profile Information</h6></div>
      <div class="card-body">
        <ng-container *ngIf="profile() as u">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="user-avatar-lg">{{ u.Name.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="fw-semibold fs-5">{{ u.Name }}</div>
              <div class="text-muted">{{ u.Email }}</div>
              <span class="badge mt-1" [class]="getRoleClass(u.Role)">{{ u.Role }}</span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" [value]="u.Name"></div>
            <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" [value]="u.Email"></div>
          </div>
        </ng-container>
      </div>
    </div>

    <div class="card cms-card" *ngIf="tab==='notifications'">
      <div class="card-header"><h6 class="card-title mb-0">Notifications</h6></div>
      <div class="card-body">
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" checked><label class="form-check-label">Email alerts for escalations</label></div>
        <div class="form-check form-switch mt-2"><input class="form-check-input" type="checkbox" checked><label class="form-check-label">Daily report digest</label></div>
      </div>
    </div>

    <div class="card cms-card" *ngIf="tab==='security'">
      <div class="card-header"><h6 class="card-title mb-0">Change Password</h6></div>
      <div class="card-body">
        <form [formGroup]="pwdForm" (ngSubmit)="changePwd()">
          <div class="mb-3"><label class="form-label fw-medium">Current Password</label><input type="password" class="form-control" formControlName="CurrentPassword"></div>
          <div class="mb-3"><label class="form-label fw-medium">New Password</label><input type="password" class="form-control" formControlName="NewPassword"></div>
          <div class="mb-3"><label class="form-label fw-medium">Confirm Password</label><input type="password" class="form-control" formControlName="ConfirmPassword"></div>
          <div class="alert alert-success py-2" *ngIf="pwdSuccess">Password changed successfully!</div>
          <div class="alert alert-danger py-2" *ngIf="pwdError">{{ pwdError }}</div>
          <button type="submit" class="btn btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-tabs-wrap {
      border: 1px solid #dbe2ee;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(31, 42, 68, 0.06);
      padding: 8px;
    }

    .profile-tabs {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .profile-tabs__item {
      min-width: 0;
    }

    .profile-tab {
      width: 100%;
      height: 44px;
      border: 1px solid transparent;
      border-radius: 12px;
      background: #f3f6fc;
      color: #5f6f8d;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      transition: all 0.18s ease;
    }

    .profile-tab:hover {
      color: #1f2a44;
      background: #ebf1ff;
    }

    .profile-tab:focus-visible {
      outline: 0;
      border-color: #3d7cff;
      box-shadow: 0 0 0 4px rgba(61, 124, 255, 0.16);
    }

    .profile-tab--active {
      color: #ffffff;
      background: linear-gradient(135deg, #3d7cff 0%, #2f6ef5 100%);
      box-shadow: 0 8px 16px rgba(61, 124, 255, 0.28);
    }

    @media (max-width: 767.98px) {
      .profile-tabs {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(UserService);
  profile = signal<User | null>(null);
  tab: 'profile' | 'notifications' | 'security' = 'profile';
  pwdSuccess = false;
  pwdError = '';
  pwdForm = this.fb.group({
    CurrentPassword: ['', Validators.required],
    NewPassword: ['', [Validators.required, Validators.minLength(8)]],
    ConfirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.svc.getMe().subscribe({
      next: res => {
        if (res.isSuccess) this.profile.set(res.data);
      }
    });
  }

  changePwd(): void {
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    if ((this.pwdForm.value.NewPassword ?? '') !== (this.pwdForm.value.ConfirmPassword ?? '')) {
      this.pwdError = 'New password and confirmation do not match.';
      this.pwdSuccess = false;
      return;
    }
    const payload: ChangePasswordRequest = {
      CurrentPassword: this.pwdForm.value.CurrentPassword ?? '',
      NewPassword: this.pwdForm.value.NewPassword ?? '',
      ConfirmPassword: this.pwdForm.value.ConfirmPassword ?? ''
    };

    this.svc.changePassword(payload).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.pwdSuccess = true;
          this.pwdError = '';
          this.pwdForm.reset();
        } else {
          this.pwdError = res.message;
        }
      },
      error: err => { this.pwdError = err.error?.message || 'Error.'; }
    });
  }

  getRoleClass(r: string): string {
    return {
      'System Administrator': 'bg-danger',
      Admin: 'bg-danger',
      Manager: 'bg-secondary',
      Supervisor: 'bg-warning text-dark',
      'Call Center Agent': 'bg-primary',
      'Technical Engineer': 'bg-primary',
      'Billing Officer': 'bg-primary',
      Agent: 'bg-primary',
      Client: 'bg-info text-dark'
    }[r] ?? 'bg-secondary';
  }
}
