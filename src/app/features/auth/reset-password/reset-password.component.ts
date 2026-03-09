import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="login-page container-fluid">
      <div class="row min-vh-100">
        <div class="col-lg-5 d-flex align-items-center justify-content-center p-4">
          <div class="surface p-4 p-md-5 login-card w-100">
            <h1 class="mb-1">Reset Password</h1>
            <p class="text-muted mb-4">Set a new password for your account.</p>

            <div class="alert alert-success py-2" *ngIf="successMsg">{{ successMsg }}</div>
            <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>

            <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-3">
              <div>
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email" />
                <div class="form-error" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
                  Enter a valid email address.
                </div>
              </div>

              <div>
                <label class="form-label">Reset Token</label>
                <input type="text" class="form-control" formControlName="resetToken" />
                <div class="form-error" *ngIf="form.get('resetToken')?.touched && form.get('resetToken')?.invalid">
                  Reset token is required.
                </div>
              </div>

              <div>
                <label class="form-label">New Password</label>
                <input type="password" class="form-control" formControlName="newPassword" />
                <div class="form-error" *ngIf="form.get('newPassword')?.touched && form.get('newPassword')?.invalid">
                  New password must be at least 8 characters.
                </div>
              </div>

              <div>
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-control" formControlName="confirmPassword" />
                <div class="form-error" *ngIf="form.get('confirmPassword')?.touched && form.get('confirmPassword')?.invalid">
                  Confirm password is required.
                </div>
              </div>

              <button class="btn btn-primary" type="submit" [disabled]="loading">
                {{ loading ? 'Resetting...' : 'Reset Password' }}
              </button>
              <a routerLink="/auth/login" class="btn btn-outline-secondary">Back to Login</a>
            </form>
          </div>
        </div>
        <div class="col-lg-7 hero d-none d-lg-flex align-items-center justify-content-center">
          <div>
            <h2>Password updates are protected by token validation.</h2>
            <p class="text-muted">Use only trusted reset links delivered to your email.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-card { max-width: 460px; }
    .form-error { font-size: 0.82rem; color: #b42318; margin-top: 0.35rem; }
    .hero {
      background: linear-gradient(135deg, #e9eeff 0%, #f7f9ff 55%, #eef3ff 100%);
      border-left: 1px solid var(--color-border);
    }
    .hero h2 { max-width: 520px; font-size: 2.1rem; margin-bottom: 0.75rem; }
  `]
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    email: [this.route.snapshot.queryParamMap.get('email') ?? '', [Validators.required, Validators.email]],
    resetToken: [
      this.route.snapshot.queryParamMap.get('resetToken')
      ?? this.route.snapshot.queryParamMap.get('token')
      ?? '',
      Validators.required
    ],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  loading = false;
  successMsg = '';
  errorMsg = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const newPassword = this.form.value.newPassword ?? '';
    const confirmPassword = this.form.value.confirmPassword ?? '';

    if (newPassword !== confirmPassword) {
      this.errorMsg = 'New password and confirmation do not match.';
      this.successMsg = '';
      return;
    }

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.auth.resetPassword({
      Email: this.form.value.email ?? '',
      ResetToken: this.form.value.resetToken ?? '',
      NewPassword: newPassword,
      ConfirmPassword: confirmPassword
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.isSuccess) {
          this.successMsg = res.message || 'Password reset successfully. You can now sign in.';
          return;
        }
        this.errorMsg = res.message || 'Unable to reset password.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Unable to reset password.';
      }
    });
  }
}
