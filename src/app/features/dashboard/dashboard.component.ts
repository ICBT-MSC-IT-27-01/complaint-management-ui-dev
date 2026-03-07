import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '@core/services/report.service';
import { AuthService } from '@core/services/auth.service';
import { DashboardData, AgentPerformanceStat, ComplaintsSummaryReport } from '@core/models/report.model';
import { ComplaintService } from '@core/services/complaint.service';
import { Complaint } from '@core/models/complaint.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Dashboard</h2>
        <p class="page-sub">Welcome back, {{ auth.currentUser()?.fullName }}</p>
      </div>
      <a routerLink="/complaints/new" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1"></i> New Complaint
      </a>
    </div>

    <div *ngIf="loading()" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <ng-container *ngIf="data() as d">
      <!-- KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card kpi-blue">
            <div class="kpi-icon"><i class="bi bi-chat-left-text-fill"></i></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ d.totalComplaints }}</div>
              <div class="kpi-label">Total Complaints</div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card kpi-orange">
            <div class="kpi-icon"><i class="bi bi-hourglass-split"></i></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ d.openComplaints }}</div>
              <div class="kpi-label">Open Complaints</div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card kpi-green">
            <div class="kpi-icon"><i class="bi bi-check-circle-fill"></i></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ d.resolvedToday }}</div>
              <div class="kpi-label">Resolved Today</div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl-3">
          <div class="kpi-card kpi-red">
            <div class="kpi-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ d.slaBreached }}</div>
              <div class="kpi-label">SLA Breached</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-3">
        <div class="col-lg-7">
          <div class="card cms-card h-100">
            <div class="card-header">
              <h6 class="card-title mb-0">Complaints by Status</h6>
            </div>
            <div class="card-body">
              <div *ngFor="let s of d.byStatus" class="status-bar-row mb-2">
                <div class="d-flex justify-content-between mb-1">
                  <span class="small fw-medium">{{ s.status }}</span>
                  <span class="small text-muted">{{ s.count }}</span>
                </div>
                <div class="progress" style="height: 8px">
                  <div class="progress-bar" [style.width.%]="getStatusPct(s.count, d.totalComplaints)"
                       [class]="getStatusClass(s.status)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card cms-card h-100">
            <div class="card-header">
              <h6 class="card-title mb-0">By Priority</h6>
            </div>
            <div class="card-body">
              <div *ngFor="let p of d.byPriority" class="priority-item">
                <span class="badge" [class]="getPriorityClass(p.priority)">{{ p.priority }}</span>
                <span class="ms-auto fw-semibold">{{ p.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card cms-card mt-3" *ngIf="byUserCounts().length">
        <div class="card-header">
          <h6 class="card-title mb-0">Complaint Counts By User</h6>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table cms-table mb-0">
              <thead>
                <tr><th>User</th><th>Assigned</th><th>Resolved</th><th>Avg Resolution (hrs)</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of byUserCounts()">
                  <td>{{ item.agentName || '-' }}</td>
                  <td>{{ item.assigned || 0 }}</td>
                  <td>{{ item.resolved || 0 }}</td>
                  <td>{{ item.avgResolutionHours || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SLA Alert Banner -->
      <div class="alert alert-warning d-flex align-items-center mt-4" *ngIf="d.slaAtRisk > 0">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>{{ d.slaAtRisk }} complaint(s) at SLA risk.</strong>
        <a routerLink="/complaints" class="ms-2 alert-link">View now</a>
      </div>
    </ng-container>
  `
})
export class DashboardComponent implements OnInit {
  private reportSvc = inject(ReportService);
  private complaintSvc = inject(ComplaintService);
  auth = inject(AuthService);
  data = signal<DashboardData | null>(null);
  byUserCounts = signal<AgentPerformanceStat[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    if (this.auth.hasRole('Admin', 'Supervisor')) {
      this.reportSvc.getDashboard().subscribe({
        next: res => {
          const parsed = this.parseEnvelope<DashboardData>(res);
          if (parsed.ok && parsed.data) this.data.set(this.normalizeDashboard(parsed.data));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });

      this.reportSvc.getComplaintSummary({}).subscribe({
        next: (res) => {
          const parsed = this.parseEnvelope<ComplaintsSummaryReport>(res);
          if (!parsed.ok || !parsed.data) return;
          this.byUserCounts.set(this.readAgentStats(parsed.data));
        }
      });
      return;
    }

    if (this.auth.hasRole('Client')) {
      this.loadClientDashboard();
      return;
    }

    this.reportSvc.getDashboard().subscribe({
      next: res => {
        const parsed = this.parseEnvelope<DashboardData>(res);
        if (parsed.ok && parsed.data) this.data.set(this.normalizeDashboard(parsed.data));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStatusPct(count: number, total: number): number {
    return total ? Math.round((count / total) * 100) : 0;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'New': 'bg-primary', 'Assigned': 'bg-info', 'InProgress': 'bg-warning',
      'Escalated': 'bg-danger', 'Resolved': 'bg-success', 'Closed': 'bg-secondary'
    };
    return map[status] ?? 'bg-secondary';
  }

  getPriorityClass(p: string): string {
    const map: Record<string, string> = {
      'Critical': 'bg-danger', 'High': 'bg-warning text-dark',
      'Medium': 'bg-info text-dark', 'Low': 'bg-success'
    };
    return map[p] ?? 'bg-secondary';
  }

  private loadClientDashboard(): void {
    this.complaintSvc.listClientPortalComplaints().subscribe({
      next: (res) => {
        const parsed = this.parseEnvelope<Complaint[]>(res);
        if (!parsed.ok || !parsed.data) {
          this.loading.set(false);
          return;
        }

        const items = (parsed.data ?? []).map((x) => this.normalizeComplaint(x));
        const totalComplaints = items.length;
        const openComplaints = items.filter((x) => !this.isClosedStatus(x.status)).length;
        const resolvedToday = items.filter((x) => this.isResolvedToday(x.status, x.resolvedDate)).length;
        const slaBreached = items.filter((x) => this.isBreached(x.slaStatus, x.isSlaBreached)).length;
        const slaAtRisk = items.filter((x) => this.isAtRisk(x.slaStatus)).length;
        const byStatusMap = new Map<string, number>();
        const byPriorityMap = new Map<string, number>();

        for (const item of items) {
          byStatusMap.set(item.status, (byStatusMap.get(item.status) ?? 0) + 1);
          byPriorityMap.set(item.priority, (byPriorityMap.get(item.priority) ?? 0) + 1);
        }

        this.data.set({
          totalComplaints,
          openComplaints,
          resolvedToday,
          slaBreached,
          slaAtRisk,
          myOpenComplaints: openComplaints,
          slaCompliancePercent: totalComplaints ? Math.round(((totalComplaints - slaBreached) * 10000) / totalComplaints) / 100 : 0,
          avgResolutionHours: 0,
          byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count })),
          byPriority: Array.from(byPriorityMap.entries()).map(([priority, count]) => ({ priority, count }))
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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

  private normalizeDashboard(value: DashboardData | Record<string, unknown>): DashboardData {
    const item = value as DashboardData & {
      TotalComplaints?: number;
      OpenComplaints?: number;
      ResolvedToday?: number;
      SlaBreached?: number;
      SlaAtRisk?: number;
      MyOpenComplaints?: number;
      SlaCompliancePercent?: number;
      AvgResolutionHours?: number;
      ByStatus?: Array<{ Status?: string; Count?: number }>;
      ByPriority?: Array<{ Priority?: string; Count?: number }>;
    };

    const byStatus = (item.byStatus ?? item.ByStatus ?? []) as Array<{
      status?: string;
      Status?: string;
      count?: number;
      Count?: number;
    }>;
    const byPriority = (item.byPriority ?? item.ByPriority ?? []) as Array<{
      priority?: string;
      Priority?: string;
      count?: number;
      Count?: number;
    }>;

    return {
      totalComplaints: item.totalComplaints ?? item.TotalComplaints ?? 0,
      openComplaints: item.openComplaints ?? item.OpenComplaints ?? 0,
      resolvedToday: item.resolvedToday ?? item.ResolvedToday ?? 0,
      slaBreached: item.slaBreached ?? item.SlaBreached ?? 0,
      slaAtRisk: item.slaAtRisk ?? item.SlaAtRisk ?? 0,
      myOpenComplaints: item.myOpenComplaints ?? item.MyOpenComplaints ?? 0,
      slaCompliancePercent: item.slaCompliancePercent ?? item.SlaCompliancePercent ?? 0,
      avgResolutionHours: item.avgResolutionHours ?? item.AvgResolutionHours ?? 0,
      byStatus: byStatus.map((x) => ({
        status: x.status ?? x.Status ?? '',
        count: x.count ?? x.Count ?? 0
      })),
      byPriority: byPriority.map((x) => ({
        priority: x.priority ?? x.Priority ?? '',
        count: x.count ?? x.Count ?? 0
      }))
    };
  }

  private readAgentStats(summary: ComplaintsSummaryReport): AgentPerformanceStat[] {
    const source = summary as ComplaintsSummaryReport & { AgentStats?: unknown[] };
    const items = (summary.agentStats ?? source.AgentStats ?? []) as Array<{
      userId?: number;
      agentName?: string;
      assigned?: number;
      resolved?: number;
      avgResolutionHours?: number;
      UserId?: number;
      AgentName?: string;
      Assigned?: number;
      Resolved?: number;
      AvgResolutionHours?: number;
    }>;
    return items.map((x) => ({
      userId: x.userId ?? x.UserId,
      agentName: x.agentName ?? x.AgentName ?? 'Unknown',
      assigned: x.assigned ?? x.Assigned ?? 0,
      resolved: x.resolved ?? x.Resolved ?? 0,
      avgResolutionHours: x.avgResolutionHours ?? x.AvgResolutionHours ?? 0
    }));
  }

  private normalizeComplaint(value: Complaint): {
    status: string;
    priority: string;
    resolvedDate?: string;
    slaStatus?: string;
    isSlaBreached?: boolean;
  } {
    const item = value as Complaint & {
      status?: string;
      priority?: string;
      resolvedDate?: string;
      slaStatus?: string;
      isSlaBreached?: boolean;
    };

    return {
      status: value.Status ?? item.status ?? 'New',
      priority: value.Priority ?? item.priority ?? 'Medium',
      resolvedDate: value.ResolvedDate ?? item.resolvedDate,
      slaStatus: value.SlaStatus ?? item.slaStatus,
      isSlaBreached: value.IsSlaBreached ?? item.isSlaBreached
    };
  }

  private isClosedStatus(status: string): boolean {
    const s = status.toLowerCase().replace(/\s+/g, '');
    return s === 'resolved' || s === 'closed';
  }

  private isResolvedToday(status: string, resolvedDate?: string): boolean {
    const s = status.toLowerCase().replace(/\s+/g, '');
    if (s !== 'resolved' && s !== 'closed') return false;
    if (!resolvedDate) return false;
    const resolved = new Date(resolvedDate);
    const today = new Date();
    return resolved.toDateString() === today.toDateString();
  }

  private isBreached(slaStatus?: string, isSlaBreached?: boolean): boolean {
    if (isSlaBreached) return true;
    const s = (slaStatus ?? '').toLowerCase();
    return s.includes('breach');
  }

  private isAtRisk(slaStatus?: string): boolean {
    const s = (slaStatus ?? '').toLowerCase();
    return s.includes('risk') || s.includes('warning');
  }
}
