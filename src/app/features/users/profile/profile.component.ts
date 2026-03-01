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

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab==='profile'}" (click)="tab='profile'">Profile</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab==='notifications'}" (click)="tab='notifications'">Notifications</button></li>
      <li class="nav-item"><button class="nav-link" [ngClass]="{active: tab==='security'}" (click)="tab='security'">Security</button></li>
    </ul>

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
  `
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
    return { Admin: 'bg-danger', Supervisor: 'bg-warning text-dark', Agent: 'bg-primary', Client: 'bg-info text-dark' }[r] ?? 'bg-secondary';
  }
}
