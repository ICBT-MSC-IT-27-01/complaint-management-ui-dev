import { Component, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RolePermission {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [NgFor, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Users & Roles</h2>
        <p class="page-sub">Define granular access for complaints management and compliance operations.</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary"><i class="bi bi-clock-history me-1"></i> Audit Trail</button>
        <button class="btn btn-primary"><i class="bi bi-copy me-1"></i> Duplicate Role</button>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-4"><div class="card cms-card"><div class="card-body"><small class="text-muted">Assigned Users</small><div class="fs-3 fw-bold">24</div></div></div></div>
      <div class="col-md-4"><div class="card cms-card"><div class="card-body"><small class="text-muted">Last Modified</small><div class="fs-3 fw-bold">Oct 12, 2023</div></div></div></div>
      <div class="col-md-4"><div class="card cms-card"><div class="card-body"><small class="text-muted">Active Permissions</small><div class="fs-3 fw-bold">18 Controls</div></div></div></div>
    </div>

    <div class="card cms-card">
      <div class="card-header"><h6 class="card-title mb-0">Role: Compliance Officer</h6></div>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AccessControlComponent {
  matrix = signal<RolePermission[]>([
    { module: 'Complaints Management', read: true, write: true, delete: false },
    { module: 'Analytics & Reports', read: true, write: true, delete: false },
    { module: 'Internal Audits', read: true, write: false, delete: false },
    { module: 'User Management', read: true, write: false, delete: false },
    { module: 'Financial Auditing', read: true, write: false, delete: false }
  ]);
}
