import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
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
    { label: 'Dashboard',   icon: 'grid-1x2-fill',    route: '/dashboard' },
    { label: 'Complaints',  icon: 'chat-left-text-fill', route: '/complaints', roles: ['Admin', 'Supervisor', 'Agent'] },
    { label: 'My Complaints', icon: 'chat-left-dots-fill', route: '/my-complaints', roles: ['Client'] },
    { label: 'Categories',  icon: 'tags-fill',        route: '/categories', roles: ['Admin', 'Supervisor'] },
    { label: 'Clients',     icon: 'building-fill',    route: '/clients' },
    { label: 'Users',       icon: 'people-fill',      route: '/users',      roles: ['Admin'] },
    { label: 'Teams',       icon: 'diagram-3-fill',   route: '/teams',      roles: ['Admin', 'Supervisor'] },
    { label: 'Access',      icon: 'shield-lock-fill', route: '/access-control', roles: ['Admin'] },
    { label: 'Reports',     icon: 'bar-chart-fill',   route: '/reports',    roles: ['Admin', 'Supervisor'] },
    { label: 'Settings',    icon: 'gear-fill',        route: '/settings' },
  ];

  get visibleItems(): NavItem[] {
    return this.navItems;
  }

  canAccess(item: NavItem): boolean {
    return !item.roles || this.auth.hasRole(...item.roles);
  }
}
