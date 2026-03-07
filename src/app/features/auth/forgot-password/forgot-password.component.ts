import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="login-page container-fluid">
      <div class="row min-vh-100">
        <div class="col-lg-5 d-flex align-items-center justify-content-center p-4">
          <div class="surface p-4 p-md-5 login-card w-100">
            <h1 class="mb-1">Forgot Password</h1>
            <p class="text-muted mb-4">Enter your account email to receive a temporary password.</p>

            <div class="alert alert-success py-2" *ngIf="successMsg">{{ successMsg }}</div>
            <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>

            <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-3">
              <div>
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email" placeholder="you@example.com" />
                <div class="form-error" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
                  Enter a valid email address.
                </div>
              </div>

              <button class="btn btn-primary" type="submit" [disabled]="loading">
                {{ loading ? 'Sending...' : 'Send Temporary Password' }}
              </button>
              <a routerLink="/auth/login" class="btn btn-outline-secondary">Back to Login</a>
            </form>
          </div>
        </div>
        <div class="col-lg-7 hero d-none d-lg-flex align-items-center justify-content-center">
          <div>
            <h2>Secure temporary password recovery for all users.</h2>
            <p class="text-muted">A random 6-character temporary password is emailed to your registered address.</p>
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;
  successMsg = '';
  errorMsg = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.auth.forgotPassword({ Email: this.form.value.email ?? '' }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.isSuccess) {
          this.successMsg = this.extractSuccessMessage(res.data) || res.message || 'If the email exists, a temporary password has been sent.';
          return;
        }
        this.errorMsg = res.message || 'Unable to process request right now.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Unable to process request right now.';
      }
    });
  }

  private extractSuccessMessage(raw: unknown): string {
    if (!raw || typeof raw !== 'object') return '';
    const data = raw as Record<string, unknown>;
    return String(data['message'] ?? data['Message'] ?? '').trim();
  }
}
