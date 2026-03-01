import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-brand">
          <div class="login-brand-icon"><i class="bi bi-shield-check"></i></div>
          <h1>CMS Portal</h1>
          <p>Complaint Management System</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">EmailOrUsername</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input type="text" class="form-control" formControlName="emailOrUsername"
                     placeholder="Enter EmailOrUsername" autocomplete="email">
            </div>
            <div class="form-error" *ngIf="form.get('emailOrUsername')?.touched && form.get('emailOrUsername')?.invalid">
              This field is required.
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                     formControlName="password" placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="input-group-text btn-toggle-pwd" (click)="showPwd = !showPwd">
                <i class="bi" [class.bi-eye]="!showPwd" [class.bi-eye-slash]="showPwd"></i>
              </button>
            </div>
            <div class="form-error" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
              Password is required.
            </div>
          </div>

          <div class="alert alert-danger py-2" *ngIf="errorMsg">
            <i class="bi bi-exclamation-circle me-2"></i>{{ errorMsg }}
          </div>

          <button type="submit" class="btn btn-primary w-100 btn-login" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    emailOrUsername: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = false;
  showPwd = false;
  errorMsg = '';

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    const payload: LoginRequest = {
      EmailOrUsername: this.form.value.emailOrUsername ?? '',
      Password: this.form.value.password ?? ''
    };

    this.auth.login(payload).subscribe({
      next: res => {
        this.loading = false;
        if (res.isSuccess) this.router.navigate(['/dashboard']);
        else this.errorMsg = res.message;
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}
