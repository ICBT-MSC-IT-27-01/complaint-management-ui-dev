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
    <div class="forgot-layout">
      <div class="forgot-left">
        <div class="forgot-card">
          <div class="brand">
            <div class="brand__icon" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <path d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" />
              </svg>
            </div>
            <span class="brand__name">CompliMate CMS</span>
          </div>

          <div class="header">
            <h1>Forgot Password</h1>
            <p>Enter your email to receive a temporary recovery password.</p>
          </div>

          <div class="alert alert-success py-2" *ngIf="successMsg">{{ successMsg }}</div>
          <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="form-stack">
            <div>
              <label class="form-label">Registered Email Address</label>
              <input type="email" class="form-control form-control-lg" formControlName="email" placeholder="e.g. admin@complimate.com" />
              <div class="form-error" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
                Enter a valid email address.
              </div>
            </div>

            <button class="btn btn-primary btn-lg w-100" type="submit" [disabled]="loading">
              {{ loading ? 'Sending...' : 'Send Temporary Password' }}
            </button>
          </form>

          <div class="back-wrap">
            <a routerLink="/auth/login" class="back-link">
              <i class="bi bi-arrow-left"></i>
              <span>Back to Login</span>
            </a>
          </div>

          <div class="support-wrap">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="$event.preventDefault()">
              Need help? Contact Support
            </button>
          </div>
        </div>
      </div>

      <div class="forgot-right">
        <div class="grid-overlay"></div>
        <div class="panel">
          <div class="panel__icon"><i class="bi bi-shield-lock"></i></div>
          <h2>Secure temporary password recovery for all users.</h2>
          <div class="panel-item">
            <i class="bi bi-check2-shield"></i>
            <p>A random 6-character temporary password is emailed to your registered address.</p>
          </div>
          <div class="panel-item">
            <i class="bi bi-clock-history"></i>
            <p>Temporary passwords should be used immediately for secure sign in.</p>
          </div>
          <div class="panel__copyright">CompliMate CMS</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-layout {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr;
      background: #f6f7f8;
    }

    .forgot-left {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.25rem;
      background: #fff;
    }

    .forgot-card {
      width: 100%;
      max-width: 440px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .brand__icon {
      width: 2rem;
      height: 2rem;
      color: #137fec;
    }

    .brand__icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    .brand__name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }

    .header {
      margin-bottom: 1.5rem;
    }

    .header h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
    }

    .header p {
      margin: 0;
      color: #64748b;
    }

    .form-stack {
      display: grid;
      gap: 1rem;
    }

    .form-label {
      font-weight: 600;
      color: #334155;
    }

    .form-control.form-control-lg {
      height: 3rem;
      border-radius: 0.5rem;
      border-color: #cbd5e1;
      font-size: 0.95rem;
    }

    .form-control:focus {
      border-color: #137fec;
      box-shadow: 0 0 0 0.18rem rgba(19, 127, 236, 0.18);
    }

    .btn.btn-primary.btn-lg {
      border-radius: 0.5rem;
      font-weight: 700;
      background: #137fec;
      border-color: #137fec;
    }

    .btn.btn-primary.btn-lg:hover {
      background: #0f6ecc;
      border-color: #0f6ecc;
    }

    .back-wrap {
      margin-top: 1.25rem;
      text-align: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: #137fec;
      text-decoration: none;
      font-weight: 600;
    }

    .back-link:hover {
      color: #0f6ecc;
    }

    .support-wrap {
      margin-top: 3rem;
      display: flex;
      justify-content: center;
    }

    .form-error { font-size: 0.82rem; color: #b42318; margin-top: 0.35rem; }

    .forgot-right {
      display: none;
      position: relative;
      overflow: hidden;
      background: linear-gradient(145deg, #137fec 0%, #0f63b8 100%);
      color: #fff;
      padding: 3rem;
    }

    .grid-overlay {
      position: absolute;
      inset: 0;
      opacity: 0.12;
      background-image: radial-gradient(circle at 2px 2px, #fff 1px, transparent 0);
      background-size: 40px 40px;
    }

    .panel {
      position: relative;
      z-index: 1;
      max-width: 600px;
      margin: auto;
      text-align: center;
    }

    .panel__icon {
      width: 6rem;
      height: 6rem;
      margin: 0 auto 1.6rem;
      border-radius: 1.5rem;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 2.8rem;
    }

    .panel h2 {
      margin: 0 0 1.5rem;
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1.25;
    }

    .panel-item {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      text-align: left;
      margin-bottom: 0.9rem;
      padding: 1rem 1.1rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.13);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .panel-item i {
      font-size: 1.2rem;
      margin-top: 0.15rem;
    }

    .panel-item p {
      margin: 0;
    }

    .panel__copyright {
      margin-top: 2rem;
      font-size: 0.85rem;
      opacity: 0.75;
    }

    @media (min-width: 992px) {
      .forgot-layout {
        grid-template-columns: 1fr 1fr;
      }

      .forgot-right {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
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
