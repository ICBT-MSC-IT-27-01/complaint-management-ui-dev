import { Component, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <header class="cms-topbar">
      <button class="topbar-toggle" (click)="toggleSidebar.emit()">
        <i class="bi bi-list"></i>
      </button>
      <div class="topbar-actions">
        <a routerLink="/complaints/new" class="btn btn-primary btn-sm btn-new-complaint">
          <i class="bi bi-plus-lg me-1"></i> New Complaint
        </a>
        <div class="topbar-user" *ngIf="auth.currentUser() as user">
          <div class="user-avatar">{{ user.fullName.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <span class="user-name">{{ user.fullName }}</span>
            <span class="user-role badge">{{ user.role }}</span>
          </div>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  auth = inject(AuthService);
}
