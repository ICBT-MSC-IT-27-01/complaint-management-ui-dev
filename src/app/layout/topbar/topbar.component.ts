import { Component, Output, EventEmitter, HostListener, ElementRef, inject } from '@angular/core';
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
      <button class="topbar-toggle" type="button" (click)="toggleSidebar.emit()">
        <i class="bi bi-list"></i>
      </button>
      <div class="topbar-search">
        <i class="bi bi-search"></i>
        <input class="form-control form-control-sm" type="search" placeholder="Search cases, users, reports..." />
      </div>
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
        <button class="btn btn-icon" type="button" aria-label="Notifications">
          <i class="bi bi-bell"></i>
        </button>
        <a routerLink="/complaints/new" class="btn btn-primary btn-sm btn-new-complaint">
          <i class="bi bi-plus-lg"></i> New Complaint
        </a>
        <div class="topbar-user-menu" *ngIf="auth.currentUser() as user">
          <button
            type="button"
            class="topbar-user-trigger"
            [attr.aria-expanded]="profileMenuOpen"
            (click)="toggleProfileMenu()">
            <span class="user-avatar" *ngIf="!avatarUrl(user)">{{ user.fullName.charAt(0).toUpperCase() }}</span>
            <img *ngIf="avatarUrl(user)" [src]="avatarUrl(user)!" alt="Profile image" class="user-avatar user-avatar--img" />
            <div class="user-info">
              <span class="user-name">{{ user.fullName }}</span>
              <span class="user-role">{{ positionLabel(user.role) }}</span>
            </div>
            <i class="bi bi-chevron-down"></i>
          </button>

          <div class="topbar-user-panel" *ngIf="profileMenuOpen">
            <div class="topbar-user-panel__head">
              <span class="user-avatar user-avatar--lg" *ngIf="!avatarUrl(user)">{{ user.fullName.charAt(0).toUpperCase() }}</span>
              <img *ngIf="avatarUrl(user)" [src]="avatarUrl(user)!" alt="Profile image" class="user-avatar user-avatar--img user-avatar--lg" />
              <div>
                <div class="user-name">{{ user.fullName }}</div>
                <div class="user-role">{{ positionLabel(user.role) }}</div>
              </div>
            </div>
            <button type="button" class="btn btn-danger btn-size-sm topbar-logout-btn" (click)="logout()">Logout</button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  private host = inject(ElementRef<HTMLElement>);
  auth = inject(AuthService);
  theme = inject(ThemeService);
  profileMenuOpen = false;

  readonly themeOptions: Array<{ value: AppTheme; label: string }> = [
    { value: 'calm-blue', label: 'Calm Blue' },
    { value: 'graphite', label: 'Graphite' },
    { value: 'emerald-ops', label: 'Emerald Ops' }
  ];

  onThemeChange(event: Event): void {
    const selectedTheme = (event.target as HTMLSelectElement).value as AppTheme;
    this.theme.setTheme(selectedTheme);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  logout(): void {
    this.profileMenuOpen = false;
    this.auth.logout();
  }

  avatarUrl(user: unknown): string | null {
    const item = user as { avatarUrl?: string; AvatarUrl?: string; profileImageUrl?: string; ProfileImageUrl?: string };
    return item.avatarUrl ?? item.AvatarUrl ?? item.profileImageUrl ?? item.ProfileImageUrl ?? null;
  }

  positionLabel(role: string): string {
    return role;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.profileMenuOpen) return;
    if (this.host.nativeElement.contains(event.target as Node)) return;
    this.profileMenuOpen = false;
  }
}
