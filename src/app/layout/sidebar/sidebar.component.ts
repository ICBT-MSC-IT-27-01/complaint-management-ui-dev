import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  section: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, NgIf, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  auth = inject(AuthService);

  private navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid-1x2-fill', route: '/dashboard', section: 'Workspace' },
    { label: 'Complaints', icon: 'chat-left-text-fill', route: '/complaints', section: 'Workspace', roles: ['Admin', 'Supervisor', 'Agent'] },
    { label: 'My Complaints', icon: 'chat-left-dots-fill', route: '/my-complaints', section: 'Workspace', roles: ['Client'] },
    { label: 'Reports', icon: 'bar-chart-fill', route: '/reports', section: 'Performance', roles: ['Admin', 'Supervisor', 'Agent'] },
    { label: 'Teams', icon: 'diagram-3-fill', route: '/teams', section: 'Performance', roles: ['Admin', 'Supervisor'] },
    { label: 'Users', icon: 'people-fill', route: '/users', section: 'Administration', roles: ['Admin'] },
    { label: 'Access Control', icon: 'shield-lock-fill', route: '/access-control', section: 'Administration', roles: ['Admin'] },
    { label: 'Categories', icon: 'tags-fill', route: '/categories', section: 'Administration', roles: ['Admin'] },
    { label: 'Departments', icon: 'diagram-2-fill', route: '/departments', section: 'Administration', roles: ['Admin', 'Supervisor'] },
    { label: 'Clients', icon: 'building-fill', route: '/clients', section: 'Administration', roles: ['Admin', 'Supervisor'] },
    { label: 'Settings', icon: 'gear-fill', route: '/settings', section: 'System', roles: ['Admin'] },
    { label: 'Theme Preview', icon: 'palette-fill', route: '/theme-preview', section: 'System', roles: ['Admin'] },
  ];

  get visibleItems(): NavItem[] {
    return this.navItems.filter(item => this.canAccess(item));
  }

  get sections(): string[] {
    const unique = new Set(this.visibleItems.map((item) => item.section));
    return Array.from(unique);
  }

  sectionItems(section: string): NavItem[] {
    return this.visibleItems.filter((item) => item.section === section);
  }

  canAccess(item: NavItem): boolean {
    return !item.roles || this.auth.hasRole(...item.roles);
  }
}
