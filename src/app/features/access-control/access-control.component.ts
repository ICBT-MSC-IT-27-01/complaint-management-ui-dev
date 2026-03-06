import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolePermissionService } from '@core/services/role-permission.service';
import { PermissionAuditItem, PermissionMatrixItem } from '@core/models/role-permission.model';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Users & Roles</h2>
        <p class="page-sub">Define granular access for complaints management and compliance operations.</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" (click)="loadAuditTrail()"><i class="bi bi-clock-history me-1"></i> Audit Trail</button>
        <button class="btn btn-primary" (click)="duplicateRole()"><i class="bi bi-copy me-1"></i> Duplicate Role</button>
      </div>
    </div>

    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label">Role</label>
            <select class="form-select" [(ngModel)]="selectedRole" (change)="loadRole()">
              <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Duplicate as new role</label>
            <input class="form-control" [(ngModel)]="duplicateRoleName" placeholder="e.g. QualityAuditor" />
          </div>
          <div class="col-md-4 d-grid">
            <button class="btn btn-success" (click)="save()">Save Permissions</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-header"><h6 class="card-title mb-0">Role: {{ selectedRole }}</h6></div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table cms-table mb-0">
            <thead><tr><th>System Module</th><th>Read</th><th>Write</th><th>Delete</th></tr></thead>
            <tbody>
              <tr *ngFor="let row of matrix()">
                <td class="fw-semibold">{{ row.module }}</td>
                <td><input class="form-check-input" type="checkbox" [(ngModel)]="row.read"></td>
                <td><input class="form-check-input" type="checkbox" [(ngModel)]="row.write"></td>
                <td><input class="form-check-input" type="checkbox" [(ngModel)]="row.delete"></td>
              </tr>
              <tr *ngIf="!matrix().length"><td colspan="4" class="text-center py-4 text-muted">No permissions found for this role.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card cms-card mt-3" *ngIf="auditTrail().length">
      <div class="card-header"><h6 class="card-title mb-0">Permission Audit Trail</h6></div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table cms-table mb-0">
            <thead><tr><th>Role</th><th>Action</th><th>Changed By</th><th>Date</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of auditTrail()">
                <td>{{ auditRole(a) }}</td>
                <td>{{ auditAction(a) }}</td>
                <td>{{ auditBy(a) }}</td>
                <td>{{ auditDate(a) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AccessControlComponent implements OnInit {
  private rolePermissionService = inject(RolePermissionService);

  matrix = signal<PermissionMatrixItem[]>([]);
  auditTrail = signal<PermissionAuditItem[]>([]);
  selectedRole = 'Agent';
  duplicateRoleName = '';
  roles = ['Admin', 'Supervisor', 'Agent', 'Client'];

  ngOnInit(): void {
    this.loadRole();
  }

  loadRole(): void {
    this.rolePermissionService.getByRole(this.selectedRole).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        this.matrix.set(this.normalizePermissions(res.data?.permissions));
      }
    });
  }

  save(): void {
    this.rolePermissionService.save({
      role: this.selectedRole,
      permissions: this.matrix()
    }).subscribe();
  }

  duplicateRole(): void {
    const newRole = this.duplicateRoleName.trim();
    if (!newRole) return;

    this.rolePermissionService.duplicate(this.selectedRole, newRole).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        if (!this.roles.includes(newRole)) this.roles = [...this.roles, newRole];
        this.duplicateRoleName = '';
      }
    });
  }

  loadAuditTrail(): void {
    this.rolePermissionService.getAuditTrail().subscribe({
      next: (res) => {
        if (res.isSuccess) this.auditTrail.set(res.data ?? []);
      }
    });
  }

  private normalizePermissions(value: unknown): PermissionMatrixItem[] {
    if (!Array.isArray(value)) return [];

    return value.map((raw) => {
      const item = raw as Record<string, unknown>;
      return {
        module: this.readString(item, ['module', 'Module', 'name', 'Name']),
        read: this.readBoolean(item, ['read', 'Read']),
        write: this.readBoolean(item, ['write', 'Write']),
        delete: this.readBoolean(item, ['delete', 'Delete'])
      };
    });
  }

  private readString(item: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = item[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return '-';
  }

  private readBoolean(item: Record<string, unknown>, keys: string[]): boolean {
    for (const key of keys) {
      const value = item[key];
      if (typeof value === 'boolean') return value;
    }
    return false;
  }

  auditRole(audit: PermissionAuditItem): string {
    const item = audit as PermissionAuditItem & { Role?: string; role?: string };
    return item.role ?? item.Role ?? '-';
  }

  auditAction(audit: PermissionAuditItem): string {
    const item = audit as PermissionAuditItem & { Action?: string; action?: string };
    return item.action ?? item.Action ?? '-';
  }

  auditBy(audit: PermissionAuditItem): string {
    const item = audit as PermissionAuditItem & { ChangedBy?: string; changedBy?: string };
    return item.changedBy ?? item.ChangedBy ?? '-';
  }

  auditDate(audit: PermissionAuditItem): string {
    const item = audit as PermissionAuditItem & { CreatedDateTime?: string; createdDateTime?: string };
    return item.createdDateTime ?? item.CreatedDateTime ?? '-';
  }
}
