import { Component, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { ThemeService, AppTheme } from '@core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor],
  template: `
    <header class="cms-topbar">
      <button class="topbar-toggle" (click)="toggleSidebar.emit()">
        <i class="bi bi-list"></i>
      </button>
      <div class="topbar-actions">
        <div class="theme-select-wrap">
          <label class="visually-hidden" for="themeSelect">Theme</label>
          <select
            id="themeSelect"
            class="form-select form-select-sm theme-select"
            [value]="theme.currentTheme()"
            (change)="onThemeChange($event)"
          >
            <option *ngFor="let option of themeOptions" [value]="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
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
  theme = inject(ThemeService);

  readonly themeOptions: Array<{ value: AppTheme; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'blue', label: 'Blue' }
  ];

  onThemeChange(event: Event): void {
    const selectedTheme = (event.target as HTMLSelectElement).value as AppTheme;
    this.theme.setTheme(selectedTheme);
  }
}
