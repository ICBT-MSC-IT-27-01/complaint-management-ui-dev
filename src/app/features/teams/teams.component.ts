import { Component, signal } from '@angular/core';
import { NgFor } from '@angular/common';

interface TeamCard {
  id: number;
  name: string;
  lead: string;
  members: number;
  compliance: number;
  status: 'Active' | 'Pending' | 'Archived';
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Teams Management</h2>
        <p class="page-sub">Organize departments, assign leadership, and track team compliance coverage.</p>
      </div>
      <button class="btn btn-primary"><i class="bi bi-plus-circle me-1"></i> Add Team</button>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-6 col-xl-3"><div class="kpi-card kpi-blue"><div class="kpi-body"><div class="kpi-value">12</div><div class="kpi-label">Total Teams</div></div></div></div>
      <div class="col-6 col-xl-3"><div class="kpi-card kpi-orange"><div class="kpi-body"><div class="kpi-value">148</div><div class="kpi-label">Total Members</div></div></div></div>
      <div class="col-6 col-xl-3"><div class="kpi-card kpi-green"><div class="kpi-body"><div class="kpi-value">12</div><div class="kpi-label">Active Leads</div></div></div></div>
      <div class="col-6 col-xl-3"><div class="kpi-card kpi-blue"><div class="kpi-body"><div class="kpi-value">94%</div><div class="kpi-label">Avg Compliance</div></div></div></div>
    </div>

    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input class="form-control" placeholder="Search teams, leads or members..." />
        </div>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-header"><h6 class="card-title mb-0">All Teams</h6></div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table cms-table mb-0">
            <thead><tr><th>Team</th><th>Lead</th><th>Members</th><th>Compliance</th><th>Status</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let t of teams()">
                <td class="fw-semibold">{{ t.name }}</td>
                <td>{{ t.lead }}</td>
                <td>{{ t.members }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 7px; min-width: 120px;">
                      <div class="progress-bar bg-success" [style.width.%]="t.compliance"></div>
                    </div>
                    <span class="small fw-semibold">{{ t.compliance }}%</span>
                  </div>
                </td>
                <td><span class="badge" [class]="statusClass(t.status)">{{ t.status }}</span></td>
                <td><button class="btn btn-sm btn-outline-secondary"><i class="bi bi-three-dots-vertical"></i></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TeamsComponent {
  teams = signal<TeamCard[]>([
    { id: 1, name: 'Fraud Operations', lead: 'Lindsay Walton', members: 24, compliance: 96, status: 'Active' },
    { id: 2, name: 'Billing Investigations', lead: 'Sarah Jenkins', members: 18, compliance: 92, status: 'Active' },
    { id: 3, name: 'Technical Escalations', lead: 'John Carter', members: 14, compliance: 88, status: 'Pending' },
    { id: 4, name: 'Audit Review', lead: 'Michael Scott', members: 9, compliance: 95, status: 'Archived' }
  ]);

  statusClass(status: TeamCard['status']): string {
    return {
      Active: 'bg-success',
      Pending: 'bg-warning text-dark',
      Archived: 'bg-secondary'
    }[status];
  }
}
