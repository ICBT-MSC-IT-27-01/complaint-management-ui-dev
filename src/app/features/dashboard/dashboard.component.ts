import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '@core/services/report.service';
import { AuthService } from '@core/services/auth.service';
import { DashboardData } from '@core/models/report.model';

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
  auth = inject(AuthService);
  data = signal<DashboardData | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.reportSvc.getDashboard().subscribe({
      next: res => { if (res.isSuccess) this.data.set(res.data); this.loading.set(false); },
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
}
