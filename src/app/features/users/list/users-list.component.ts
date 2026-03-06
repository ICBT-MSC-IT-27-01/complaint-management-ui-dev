import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { User, UserSearchRequest } from '@core/models/user.model';
import { PagedResult } from '@core/models/api-response.model';
import { downloadBlobFile } from '@core/utils/download.util';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">User Management</h2>
        <p class="page-sub">Manage access, assign roles, and configure hierarchy for your team.</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" (click)="exportCsv()"><i class="bi bi-download me-1"></i> Export CSV</button>
        <a routerLink="/users/new" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Create User</a>
      </div>
    </div>

    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-lg-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" placeholder="Search by name, email or ID..." [(ngModel)]="req.Keyword" (keyup.enter)="load()">
            </div>
          </div>
          <div class="col-lg-3">
            <select class="form-select" [(ngModel)]="req.Role">
              <option value="">All Roles</option><option>Admin</option><option>Supervisor</option><option>Agent</option><option>Client</option>
            </select>
          </div>
          <div class="col-lg-3">
            <select class="form-select" [(ngModel)]="req.IsActive">
              <option [ngValue]="undefined">All Statuses</option>
              <option [ngValue]="true">Active</option>
              <option [ngValue]="false">Inactive</option>
            </select>
          </div>
          <div class="col-lg-12 d-flex gap-2 justify-content-end">
            <button class="btn btn-primary" (click)="load()">Filter</button>
            <button class="btn btn-outline-secondary" (click)="clearFilters()"><i class="bi bi-x-lg"></i></button>
          </div>
        </div>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
        <div class="table-responsive" *ngIf="!loading()">
          <table class="table table-hover cms-table mb-0">
            <thead><tr><th>User</th><th>Role</th><th>Reports To</th><th>Status</th><th>Last Active</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of result()?.items">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="user-avatar">{{ initials(userName(u)) }}</div>
                    <div>
                      <div class="fw-semibold">{{ userName(u) }}</div>
                      <small class="text-muted">{{ userEmail(u) }}</small>
                    </div>
                  </div>
                </td>
                <td><span class="badge" [class]="getRoleClass(userRole(u))">{{ userRole(u) }}</span></td>
                <td class="text-muted">{{ managerName(userRole(u)) }}</td>
                <td>
                  <div class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" [checked]="userIsActive(u)" disabled>
                  </div>
                </td>
                <td class="small text-muted">{{ userLastLogin(u) ? (userLastLogin(u) | date:'MMM d, h:mm a') : 'Never' }}</td>
                <td class="text-end">
                  <a class="btn btn-sm btn-outline-primary me-2" [routerLink]="['/users', userId(u)]"><i class="bi bi-pencil"></i></a>
                  <button class="btn btn-sm btn-outline-danger" (click)="delete(userId(u))"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="!result()?.items?.length">
                <td colspan="6" class="text-center py-4 text-muted"><i class="bi bi-people fs-3 d-block mb-2"></i>No users found</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top" *ngIf="result()">
          <small class="text-muted">Showing {{ result()!.items.length }} of {{ result()!.totalCount }} users</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="req.Page === 1" (click)="changePage(-1)"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-outline-secondary" [disabled]="req.Page! >= result()!.totalPages" (click)="changePage(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private svc = inject(UserService);
  result = signal<PagedResult<User> | null>(null);
  loading = signal(true);
  req: UserSearchRequest = { Page: 1, PageSize: 20 };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.search(this.req).subscribe({
      next: r => {
        if (r.isSuccess) this.result.set(r.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void { this.req = { Page: 1, PageSize: 20 }; this.load(); }
  changePage(delta: number): void { this.req.Page = (this.req.Page ?? 1) + delta; this.load(); }
  delete(id: number): void { if (!confirm('Deactivate this user?')) return; this.svc.delete(id).subscribe(() => this.load()); }
  exportCsv(): void {
    this.svc.exportCsv().subscribe({
      next: (blob) => downloadBlobFile(blob, `users-${new Date().toISOString().slice(0, 10)}.csv`)
    });
  }

  getRoleClass(r: string): string {
    return { Admin: 'bg-danger', Supervisor: 'bg-warning text-dark', Agent: 'bg-primary', Client: 'bg-info text-dark' }[r] ?? 'bg-secondary';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
  }

  managerName(role: string): string {
    if (role === 'Admin') return 'System';
    if (role === 'Supervisor') return 'Admin';
    if (role === 'Agent') return 'Supervisor';
    return 'External';
  }

  userId(u: User): number {
    const item = u as User & { id?: number };
    return u.Id ?? item.id ?? 0;
  }

  userName(u: User): string {
    const item = u as User & { name?: string };
    return u.Name ?? item.name ?? '-';
  }

  userEmail(u: User): string {
    const item = u as User & { email?: string };
    return u.Email ?? item.email ?? '-';
  }

  userRole(u: User): string {
    const item = u as User & { role?: string };
    return u.Role ?? item.role ?? '-';
  }

  userIsActive(u: User): boolean {
    const item = u as User & { isActive?: boolean };
    return u.IsActive ?? item.isActive ?? false;
  }

  userLastLogin(u: User): string | undefined {
    const item = u as User & { lastLoginDateTime?: string };
    return u.LastLoginDateTime ?? item.lastLoginDateTime;
  }
}
