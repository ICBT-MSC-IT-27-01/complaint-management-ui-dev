import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="cms-shell" [class.sidebar-collapsed]="collapsed()">
      <app-sidebar [collapsed]="collapsed()" (toggleSidebar)="collapsed.set(!collapsed())" />
      <div class="cms-main">
        <app-topbar (toggleSidebar)="collapsed.set(!collapsed())" />
        <main class="cms-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {
  collapsed = signal(false);
}
