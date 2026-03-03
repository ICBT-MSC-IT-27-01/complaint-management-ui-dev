import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest, ClientRegisterRequest } from '@core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  staffForm = this.fb.group({
    emailOrUsername: ['', Validators.required],
    password: ['', Validators.required]
  });

  clientEmailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  clientLoginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  clientRegisterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  mode: 'staff' | 'client' = 'staff';
  clientStep: 'email' | 'login' | 'register' = 'email';
  loading = false;
  showPwd = false;
  showClientPwd = false;
  showClientRegisterPwd = false;
  showClientConfirmPwd = false;
  errorMsg = '';
  successMsg = '';

  setMode(mode: 'staff' | 'client'): void {
    this.mode = mode;
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = false;

    if (mode === 'client') {
      this.clientStep = 'email';
    }
  }

  submitStaffLogin(): void {
    if (this.staffForm.invalid) { this.staffForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload: LoginRequest = {
      EmailOrUsername: this.staffForm.value.emailOrUsername ?? '',
      Password: this.staffForm.value.password ?? ''
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

  submitClientEmail(): void {
    if (this.clientEmailForm.invalid) { this.clientEmailForm.markAllAsTouched(); return; }

    const email = (this.clientEmailForm.value.email ?? '').trim();
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.auth.checkEmailExists(email).subscribe({
      next: exists => {
        this.loading = false;
        if (exists) {
          this.clientStep = 'login';
          this.clientLoginForm.patchValue({ email });
          return;
        }

        this.clientStep = 'register';
        this.clientRegisterForm.patchValue({ email });
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Unable to verify email right now. Please try again.';
      }
    });
  }

  submitClientLogin(): void {
    if (this.clientLoginForm.invalid) { this.clientLoginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload: LoginRequest = {
      EmailOrUsername: this.clientLoginForm.value.email ?? '',
      Password: this.clientLoginForm.value.password ?? ''
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

  submitClientRegister(): void {
    if (this.clientRegisterForm.invalid) { this.clientRegisterForm.markAllAsTouched(); return; }

    const password = this.clientRegisterForm.value.password ?? '';
    const confirmPassword = this.clientRegisterForm.value.confirmPassword ?? '';

    if (password !== confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload: ClientRegisterRequest = {
      Name: this.clientRegisterForm.value.name ?? '',
      Email: this.clientRegisterForm.value.email ?? '',
      PhoneNumber: this.clientRegisterForm.value.phoneNumber ?? '',
      Password: password,
      ConfirmPassword: confirmPassword
    };

    this.auth.registerClient(payload).subscribe({
      next: res => {
        this.loading = false;
        if (!res.isSuccess) {
          this.errorMsg = res.message || 'Unable to create account.';
          return;
        }

        if (this.auth.isAuthenticated()) {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.clientStep = 'login';
        this.clientLoginForm.patchValue({ email: payload.Email, password: '' });
        this.successMsg = 'Account created successfully. Please sign in.';
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  backToClientEmail(): void {
    this.clientStep = 'email';
    this.errorMsg = '';
    this.successMsg = '';
    this.clientLoginForm.patchValue({ password: '' });
    this.clientRegisterForm.patchValue({ password: '', confirmPassword: '' });
  }
}
