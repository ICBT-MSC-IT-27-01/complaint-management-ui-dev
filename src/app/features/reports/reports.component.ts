import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '@core/services/report.service';
import { ReportFilterRequest } from '@core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Reports Overview</h2>
        <p class="page-sub">Live complaint performance metrics and executive summaries.</p>
      </div>
      <button class="btn btn-primary" (click)="load()"><i class="bi bi-arrow-clockwise me-1"></i> Refresh</button>
    </div>

    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3"><label class="form-label">From Date</label><input type="date" class="form-control" [(ngModel)]="filter.from"></div>
          <div class="col-md-3"><label class="form-label">To Date</label><input type="date" class="form-control" [(ngModel)]="filter.to"></div>
          <div class="col-auto">
            <button class="btn btn-primary" (click)="load()"><i class="bi bi-funnel me-1"></i>Apply</button>
            <button class="btn btn-outline-secondary ms-1" (click)="filter={}; load()">Clear</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <ng-container *ngIf="summary() && !loading()">
      <div class="row g-3 mb-3">
        <div class="col-sm-6 col-xl-3"><div class="kpi-card kpi-blue"><div class="kpi-body"><div class="kpi-value">1,284</div><div class="kpi-label">Total Complaints</div></div></div></div>
        <div class="col-sm-6 col-xl-3"><div class="kpi-card kpi-orange"><div class="kpi-body"><div class="kpi-value">3.4d</div><div class="kpi-label">Avg Resolution</div></div></div></div>
        <div class="col-sm-6 col-xl-3"><div class="kpi-card kpi-green"><div class="kpi-body"><div class="kpi-value">98.2%</div><div class="kpi-label">Compliance Score</div></div></div></div>
        <div class="col-sm-6 col-xl-3"><div class="kpi-card kpi-blue"><div class="kpi-body"><div class="kpi-value">45</div><div class="kpi-label">Pending Reviews</div></div></div></div>
      </div>

      <div class="row g-3">
        <div class="col-xl-8">
          <div class="card cms-card h-100"><div class="card-header"><h6 class="card-title mb-0">Complaint Volume Trends</h6></div><div class="card-body"><div class="chart-placeholder"></div></div></div>
        </div>
        <div class="col-xl-4">
          <div class="card cms-card h-100"><div class="card-header"><h6 class="card-title mb-0">Status Distribution</h6></div><div class="card-body"><div class="pie-placeholder"></div></div></div>
        </div>
      </div>
    </ng-container>

    <div class="alert alert-info mt-3" *ngIf="!loading() && !summary()">
      <i class="bi bi-info-circle me-2"></i>No summary data available for the selected period.
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private svc = inject(ReportService);
  summary = signal<object | null>(null);
  loading = signal(false);
  filter: ReportFilterRequest = {};

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getComplaintSummary(this.filter).subscribe({
      next: r => {
        if (r.isSuccess) this.summary.set(r.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
