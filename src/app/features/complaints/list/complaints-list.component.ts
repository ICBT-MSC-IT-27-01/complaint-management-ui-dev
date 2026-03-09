import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '@core/services/complaint.service';
import { AuthService } from '@core/services/auth.service';
import { Complaint, ComplaintSearchRequest } from '@core/models/complaint.model';
import { PagedResult } from '@core/models/api-response.model';
import { downloadBlobFile } from '@core/utils/download.util';

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, NgClass, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Master List</h2>
        <p class="page-sub">Complaints / All Complaints</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" (click)="exportCsv()">
          <i class="bi bi-download me-1"></i> Export CSV
        </button>
        <a routerLink="/complaints/new" class="btn btn-primary btn-new-complaint" *ngIf="auth.hasRole('Admin','Supervisor','Agent')">
          <i class="bi bi-plus-lg"></i> New Complaint
        </a>
      </div>
    </div>

    <div class="cms-kpi-grid">
      <div class="kpi-card kpi-blue"><div class="kpi-body"><div class="kpi-label">Total Open</div><div class="kpi-value">{{ result()?.totalCount || 0 }}</div></div></div>
      <div class="kpi-card kpi-orange"><div class="kpi-body"><div class="kpi-label">Unassigned</div><div class="kpi-value">{{ unassignedCount() }}</div></div></div>
      <div class="kpi-card kpi-red"><div class="kpi-body"><div class="kpi-label">High Priority</div><div class="kpi-value">{{ highPriorityCount() }}</div></div></div>
      <div class="kpi-card kpi-green"><div class="kpi-body"><div class="kpi-label">Resolved Today</div><div class="kpi-value">{{ resolvedTodayCount() }}</div></div></div>
    </div>

    <div class="cms-filterbar mb-3">
      <div class="filter-quick-row">
        <button type="button" class="quick-filter-chip" [class.active]="quickView() === 'all'" (click)="applyQuickView('all')">All</button>
        <button type="button" class="quick-filter-chip" [class.active]="quickView() === 'new'" (click)="applyQuickView('new')">New</button>
        <button type="button" class="quick-filter-chip" [class.active]="quickView() === 'inprogress'" (click)="applyQuickView('inprogress')">In Progress</button>
        <button type="button" class="quick-filter-chip" [class.active]="quickView() === 'critical'" (click)="applyQuickView('critical')">Critical</button>
        <button type="button" class="quick-filter-chip" [class.active]="quickView() === 'unassigned'" (click)="applyQuickView('unassigned')">Unassigned</button>
        <select class="form-select form-select-sm ms-auto" style="max-width: 160px;" [ngModel]="density()" (ngModelChange)="setDensity($event)">
          <option value="regular">Density: Regular</option>
          <option value="compact">Density: Compact</option>
        </select>
      </div>
      <div class="row g-2 align-items-end">
        <div class="col-lg-5">
          <input type="text" class="form-control" placeholder="Search by ID, client name, subject..." [(ngModel)]="req.Q" (keyup.enter)="load()">
        </div>
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="req.StatusId">
            <option [value]="undefined">Status: All</option>
            <option [value]="1">New</option><option [value]="2">Assigned</option>
            <option [value]="3">InProgress</option><option [value]="5">Escalated</option>
            <option [value]="6">Resolved</option><option [value]="7">Closed</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="req.Priority">
            <option value="">Priority: All</option>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <div class="col-md-auto d-flex align-items-center gap-2">
          <select class="form-select" style="min-width: 170px;" [ngModel]="savedView()" (ngModelChange)="applySavedView($event)">
            <option value="default">Saved View: Default</option>
            <option value="critical">Saved View: Critical Queue</option>
            <option value="triage">Saved View: Triage Queue</option>
            <option value="resolved">Saved View: Resolved</option>
          </select>
          <button class="btn btn-outline-primary" (click)="load()"><i class="bi bi-search me-1"></i> Filter</button>
          <button class="btn btn-link text-decoration-none" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

        <div class="cms-table-wrap" *ngIf="!loading()" [class.table-density-compact]="density() === 'compact'">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Complaint ID</th><th>Client Name</th><th>Source</th>
                <th>Status</th><th>Priority</th><th>Assignee</th><th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of result()?.items" [ngClass]="rowClass(c)">
                <td>
                  <div class="fw-semibold">{{ complaintNumber(c) }}</div>
                </td>
                <td>{{ clientName(c) }}</td>
                <td>{{ channel(c) }}</td>
                <td><span class="badge" [class]="getStatusClass(status(c))">{{ status(c) }}</span></td>
                <td><span class="badge" [class]="getPriorityClass(priority(c))">{{ priority(c) }}</span></td>
                <td>{{ assignee(c) }}</td>
                <td class="text-end">
                  <div class="d-inline-flex gap-1">
                    <a [routerLink]="['/complaints', complaintId(c)]" class="btn btn-sm btn-outline-primary btn-open-action">Open</a>
                    <button
                      *ngIf="auth.hasRole('Admin','Supervisor','Agent')"
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      [disabled]="deletingId() === complaintId(c)"
                      (click)="deleteComplaint(c)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!result()?.items?.length"><td colspan="7" class="text-center py-4 text-muted">No complaints found</td></tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center px-3 py-3 border-top" *ngIf="result()">
          <small class="text-muted">Showing {{ (req.Page! - 1) * req.PageSize! + 1 }}-{{ Math.min(req.Page! * req.PageSize!, result()!.totalCount) }} of {{ result()!.totalCount }} results</small>
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
  deletingId = signal<number | null>(null);
  quickView = signal<'all' | 'new' | 'inprogress' | 'critical' | 'unassigned'>('all');
  savedView = signal<'default' | 'critical' | 'triage' | 'resolved'>('default');
  density = signal<'regular' | 'compact'>('regular');
  req: ComplaintSearchRequest = { Page: 1, PageSize: 15 };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.search(this.req).subscribe({
      next: (res) => {
        const parsed = this.parseEnvelope<PagedResult<Complaint>>(res);
        if (parsed.ok && parsed.data) this.result.set(this.normalizePagedResult(parsed.data));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void {
    this.req = { Page: 1, PageSize: 15 };
    this.quickView.set('all');
    this.savedView.set('default');
    this.load();
  }

  applyQuickView(view: 'all' | 'new' | 'inprogress' | 'critical' | 'unassigned'): void {
    this.quickView.set(view);
    this.req.Page = 1;
    this.req.StatusId = undefined;
    this.req.Priority = '';
    this.req.AssignedToUserId = undefined;

    if (view === 'new') this.req.StatusId = 1;
    if (view === 'inprogress') this.req.StatusId = 3;
    if (view === 'critical') this.req.Priority = 'Critical';
    if (view === 'unassigned') this.req.AssignedToUserId = 0;

    this.req.Page = 1;
    this.load();
  }

  applySavedView(view: string): void {
    const selected = (['default', 'critical', 'triage', 'resolved'].includes(view) ? view : 'default') as 'default' | 'critical' | 'triage' | 'resolved';
    this.savedView.set(selected);
    this.req = { ...this.req, Page: 1 };

    if (selected === 'default') {
      this.req.StatusId = undefined;
      this.req.Priority = '';
      this.req.AssignedToUserId = undefined;
      this.quickView.set('all');
    }

    if (selected === 'critical') {
      this.req.StatusId = undefined;
      this.req.Priority = 'Critical';
      this.req.AssignedToUserId = undefined;
      this.quickView.set('critical');
    }

    if (selected === 'triage') {
      this.req.StatusId = 1;
      this.req.Priority = '';
      this.req.AssignedToUserId = 0;
      this.quickView.set('unassigned');
    }

    if (selected === 'resolved') {
      this.req.StatusId = 6;
      this.req.Priority = '';
      this.req.AssignedToUserId = undefined;
      this.quickView.set('all');
    }

    this.load();
  }

  setDensity(value: string): void {
    this.density.set(value === 'compact' ? 'compact' : 'regular');
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

  deleteComplaint(c: Complaint): void {
    const id = this.complaintId(c);
    if (!id || !this.auth.hasRole('Admin', 'Supervisor', 'Agent')) return;
    if (!confirm(`Delete complaint ${this.complaintNumber(c)}? This action cannot be undone.`)) return;

    this.deletingId.set(id);
    this.svc.delete(id).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        const currentPage = this.req.Page ?? 1;
        const currentCount = this.result()?.items.length ?? 0;
        this.req.Page = currentPage > 1 && currentCount === 1 ? currentPage - 1 : currentPage;
        this.load();
      },
      error: () => {},
      complete: () => this.deletingId.set(null)
    });
  }

  getPriorityClass(p: string): string {
    return { Critical: 'bg-danger', High: 'bg-warning text-dark', Medium: 'bg-info text-dark', Low: 'bg-success' }[p] ?? 'bg-secondary';
  }

  getStatusClass(s: string): string {
    const key = (s ?? '').toLowerCase().replace(/\s+/g, '');
    return {
      new: 'badge-status-new',
      assigned: 'badge-status-assigned',
      inprogress: 'badge-status-inprogress',
      escalated: 'badge-status-escalated',
      resolved: 'badge-status-resolved',
      closed: 'badge-status-closed'
    }[key] ?? 'bg-secondary';
  }

  complaintId(c: Complaint): number {
    const item = c as Complaint & {
      id?: number;
      complaintId?: number;
      ComplaintId?: number;
    };
    return c.Id ?? item.id ?? item.complaintId ?? item.ComplaintId ?? 0;
  }

  complaintNumber(c: Complaint): string {
    const item = c as Complaint & {
      complaintNumber?: string;
      ComplaintNo?: string;
      complaintNo?: string;
      ticketNumber?: string;
      TicketNumber?: string;
    };
    return this.pickText(
      c.ComplaintNumber,
      item.complaintNumber,
      item.ComplaintNo,
      item.complaintNo,
      item.ticketNumber,
      item.TicketNumber
    );
  }

  status(c: Complaint): string {
    const item = c as Complaint & {
      status?: string;
      statusName?: string;
      StatusName?: string;
      complaintStatus?: string;
      ComplaintStatus?: string;
    };
    return this.pickText(
      c.Status,
      item.status,
      item.statusName,
      item.StatusName,
      item.complaintStatus,
      item.ComplaintStatus
    );
  }

  priority(c: Complaint): string {
    const item = c as Complaint & {
      priority?: string;
      priorityName?: string;
      PriorityName?: string;
    };
    return this.pickText(c.Priority, item.priority, item.priorityName, item.PriorityName);
  }

  clientName(c: Complaint): string {
    const item = c as Complaint & {
      clientName?: string;
      customerName?: string;
      CustomerName?: string;
      client?: { name?: string; Name?: string };
      Client?: { name?: string; Name?: string };
    };
    return this.pickText(
      c.ClientName,
      item.clientName,
      item.customerName,
      item.CustomerName,
      item.client?.name,
      item.client?.Name,
      item.Client?.name,
      item.Client?.Name
    );
  }

  category(c: Complaint): string {
    const item = c as Complaint & { category?: string };
    return c.Category ?? item.category ?? '-';
  }

  assignee(c: Complaint): string {
    const item = c as Complaint & {
      assignedToName?: string;
      AssignedTo?: string;
      assignedTo?: string;
      ownerName?: string;
      OwnerName?: string;
    };
    return this.pickText(
      c.AssignedToName,
      item.assignedToName,
      item.AssignedTo,
      item.assignedTo,
      item.ownerName,
      item.OwnerName,
      'Unassigned'
    );
  }

  channel(c: Complaint): string {
    const item = c as Complaint & {
      channel?: string;
      source?: string;
      Source?: string;
      complaintSource?: string;
      ComplaintSource?: string;
      channelName?: string;
      ChannelName?: string;
    };
    return this.pickText(
      c.Channel,
      item.channel,
      item.source,
      item.Source,
      item.complaintSource,
      item.ComplaintSource,
      item.channelName,
      item.ChannelName
    );
  }

  rowClass(c: Complaint): Record<string, boolean> {
    const priority = this.priority(c).toLowerCase();
    const slaText = String(c.SlaStatus ?? (c as Complaint & { slaStatus?: string }).slaStatus ?? '').toLowerCase();
    const isRisk = slaText.includes('risk') || slaText.includes('warning') || c.IsSlaBreached === true;
    return {
      'row-critical': priority === 'critical',
      'row-sla-risk': isRisk
    };
  }

  unassignedCount(): number {
    return (this.result()?.items ?? []).filter((item) => this.assignee(item) === 'Unassigned').length;
  }

  highPriorityCount(): number {
    return (this.result()?.items ?? []).filter((item) => {
      const current = this.priority(item).toLowerCase();
      return current === 'high' || current === 'critical';
    }).length;
  }

  resolvedTodayCount(): number {
    const today = new Date().toDateString();
    return (this.result()?.items ?? []).filter((item) => {
      const value = (item.ResolvedDate ?? (item as Complaint & { resolvedDate?: string }).resolvedDate);
      if (!value) return false;
      return new Date(value).toDateString() === today;
    }).length;
  }

  private parseEnvelope<T>(response: unknown): { ok: boolean; data: T | null } {
    const item = response as {
      isSuccess?: boolean;
      IsSuccess?: boolean;
      data?: T;
      Data?: T;
    };

    const ok = (item.isSuccess ?? item.IsSuccess) === true;
    const data = (item.data ?? item.Data ?? null) as T | null;
    return { ok, data };
  }

  private normalizePagedResult(value: PagedResult<Complaint> | Record<string, unknown>): PagedResult<Complaint> {
    const item = value as PagedResult<Complaint> & {
      Page?: number;
      PageSize?: number;
      TotalCount?: number;
      TotalPages?: number;
      Items?: Complaint[];
    };
    const rawItems = item.items ?? item.Items ?? [];

    return {
      page: item.page ?? item.Page ?? 1,
      pageSize: item.pageSize ?? item.PageSize ?? 15,
      totalCount: item.totalCount ?? item.TotalCount ?? 0,
      totalPages: item.totalPages ?? item.TotalPages ?? 1,
      items: rawItems.map((entry) => this.normalizeComplaint(entry))
    };
  }

  private normalizeComplaint(value: Complaint): Complaint {
    const item = value as Complaint & {
      id?: number;
      complaintId?: number;
      ComplaintId?: number;
      complaintNumber?: string;
      status?: string;
      priority?: string;
      clientName?: string;
      channel?: string;
      source?: string;
      assignedToName?: string;
    };

    return {
      ...value,
      Id: value.Id ?? item.id ?? item.complaintId ?? item.ComplaintId ?? 0,
      ComplaintNumber: value.ComplaintNumber ?? item.complaintNumber ?? '-',
      Status: value.Status ?? item.status ?? '-',
      Priority: value.Priority ?? item.priority ?? '-',
      ClientName: value.ClientName ?? item.clientName,
      Channel: value.Channel ?? item.channel ?? item.source ?? '-',
      AssignedToName: value.AssignedToName ?? item.assignedToName
    };
  }

  private pickText(...values: Array<string | null | undefined>): string {
    for (const value of values) {
      if (typeof value !== 'string') continue;
      const normalized = value.trim();
      if (normalized) return normalized;
    }
    return '-';
  }
}
