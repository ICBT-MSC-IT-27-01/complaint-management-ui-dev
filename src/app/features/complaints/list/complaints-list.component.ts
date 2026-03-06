import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '@core/services/complaint.service';
import { AuthService } from '@core/services/auth.service';
import { Complaint, ComplaintSearchRequest } from '@core/models/complaint.model';
import { PagedResult } from '@core/models/api-response.model';
import { downloadBlobFile } from '@core/utils/download.util';

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Complaints</h2>
        <p class="page-sub">Manage and track all complaints</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" (click)="exportCsv()">
          <i class="bi bi-download me-1"></i> Export CSV
        </button>
        <a routerLink="/complaints/new" class="btn btn-primary" *ngIf="auth.hasRole('Admin','Supervisor','Agent')">
          <i class="bi bi-plus-lg me-1"></i> New Complaint
        </a>
      </div>
    </div>

    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <input type="text" class="form-control form-control-sm" placeholder="Search subject, number, client..." [(ngModel)]="req.Q" (keyup.enter)="load()">
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" [(ngModel)]="req.Priority">
              <option value="">All Priorities</option>
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" [(ngModel)]="req.StatusId">
              <option [value]="undefined">All Statuses</option>
              <option [value]="1">New</option><option [value]="2">Assigned</option>
              <option [value]="3">InProgress</option><option [value]="5">Escalated</option>
              <option [value]="6">Resolved</option><option [value]="7">Closed</option>
            </select>
          </div>
          <div class="col-md-auto">
            <button class="btn btn-primary btn-sm" (click)="load()"><i class="bi bi-search me-1"></i> Filter</button>
            <button class="btn btn-outline-secondary btn-sm ms-1" (click)="clearFilters()">Clear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

        <div class="table-responsive" *ngIf="!loading()">
          <table class="table table-hover cms-table mb-0">
            <thead>
              <tr>
                <th>Complaint ID</th><th>Client Name</th><th>Category</th>
                <th>Status</th><th>Priority</th><th>Assignee</th><th class="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of result()?.items">
                <td><code class="text-primary">{{ complaintNumber(c) }}</code></td>
                <td>{{ clientName(c) }}</td>
                <td>{{ category(c) }}</td>
                <td><span class="badge" [class]="getStatusClass(status(c))">{{ status(c) }}</span></td>
                <td><span class="badge" [class]="getPriorityClass(priority(c))">{{ priority(c) }}</span></td>
                <td>{{ assignee(c) }}</td>
                <td class="text-end"><a [routerLink]="['/complaints', complaintId(c)]" class="btn btn-sm btn-outline-primary">Open</a></td>
              </tr>
              <tr *ngIf="!result()?.items?.length"><td colspan="7" class="text-center py-4 text-muted"><i class="bi bi-inbox fs-3 d-block mb-2"></i>No complaints found</td></tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top" *ngIf="result()">
          <small class="text-muted">Showing {{ (req.Page! - 1) * req.PageSize! + 1 }}-{{ Math.min(req.Page! * req.PageSize!, result()!.totalCount) }} of {{ result()!.totalCount }}</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="req.Page === 1" (click)="changePage(-1)"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-outline-secondary" [disabled]="req.Page! >= result()!.totalPages" (click)="changePage(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComplaintsListComponent implements OnInit {
  private svc = inject(ComplaintService);
  auth = inject(AuthService);
  Math = Math;

  result = signal<PagedResult<Complaint> | null>(null);
  loading = signal(true);
  req: ComplaintSearchRequest = { Page: 1, PageSize: 15 };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.search(this.req).subscribe({
      next: (res) => { if (res.isSuccess) this.result.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void {
    this.req = { Page: 1, PageSize: 15 };
    this.load();
  }

  changePage(delta: number): void {
    this.req.Page = (this.req.Page ?? 1) + delta;
    this.load();
  }

  exportCsv(): void {
    this.svc.exportCsv().subscribe({
      next: (blob) => downloadBlobFile(blob, `complaints-${new Date().toISOString().slice(0, 10)}.csv`)
    });
  }

  getPriorityClass(p: string): string {
    return { Critical: 'bg-danger', High: 'bg-warning text-dark', Medium: 'bg-info text-dark', Low: 'bg-success' }[p] ?? 'bg-secondary';
  }

  getStatusClass(s: string): string {
    return {
      New: 'badge-status-new',
      Assigned: 'badge-status-assigned',
      InProgress: 'badge-status-inprogress',
      Escalated: 'badge-status-escalated',
      Resolved: 'badge-status-resolved',
      Closed: 'badge-status-closed'
    }[s] ?? 'bg-secondary';
  }

  complaintId(c: Complaint): number {
    const item = c as Complaint & { id?: number };
    return c.Id ?? item.id ?? 0;
  }

  complaintNumber(c: Complaint): string {
    const item = c as Complaint & { complaintNumber?: string };
    return c.ComplaintNumber ?? item.complaintNumber ?? '-';
  }

  status(c: Complaint): string {
    const item = c as Complaint & { status?: string };
    return c.Status ?? item.status ?? '-';
  }

  priority(c: Complaint): string {
    const item = c as Complaint & { priority?: string };
    return c.Priority ?? item.priority ?? '-';
  }

  clientName(c: Complaint): string {
    const item = c as Complaint & { clientName?: string };
    return c.ClientName ?? item.clientName ?? '-';
  }

  category(c: Complaint): string {
    const item = c as Complaint & { category?: string };
    return c.Category ?? item.category ?? '-';
  }

  assignee(c: Complaint): string {
    const item = c as Complaint & { assignedToName?: string };
    return c.AssignedToName ?? item.assignedToName ?? 'Unassigned';
  }
}
