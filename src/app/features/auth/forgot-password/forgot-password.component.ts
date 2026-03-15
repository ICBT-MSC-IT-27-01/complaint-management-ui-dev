import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { showValidationAlert, trimFormValues } from '@core/utils/form-validation.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
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
    trimFormValues(this.form, ['email']);
    if (this.form.invalid) {
      showValidationAlert(this.form, {
        email: { label: 'Registered Email Address', type: 'email' }
      });
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
