import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="cms-shell" [class.sidebar-collapsed]="collapsed()">
      <button
        type="button"
        class="cms-sidebar-backdrop"
        [class.mobile-open]="mobileSidebarOpen()"
        (click)="closeMobileSidebar()"
        aria-label="Close navigation menu">
      </button>
      <app-sidebar
        [collapsed]="collapsed()"
        [mobileOpen]="mobileSidebarOpen()"
        (toggleSidebar)="toggleSidebar()"
      />
      <div class="cms-main">
        <app-topbar (toggleSidebar)="toggleSidebar()" />
        <main class="cms-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {
  collapsed = signal(false);
  mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    if (this.isMobileViewport()) {
      this.mobileSidebarOpen.set(!this.mobileSidebarOpen());
      return;
    }

    this.collapsed.set(!this.collapsed());
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isMobileViewport()) {
      this.mobileSidebarOpen.set(false);
    }
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 767;
  }
}
