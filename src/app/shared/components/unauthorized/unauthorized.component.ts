import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100">
      <div class="text-center">
        <div class="display-1 text-warning mb-3"><i class="bi bi-shield-exclamation"></i></div>
        <h2 class="fw-bold mb-2">Access Denied</h2>
        <p class="text-muted mb-4">You don't have permission to access this page.</p>
        <a routerLink="/dashboard" class="btn btn-primary">Back to Dashboard</a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}
