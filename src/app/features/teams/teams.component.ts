import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamService } from '@core/services/team.service';
import { Team } from '@core/models/team.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Teams Management</h2>
        <p class="page-sub">Organize departments, assign leadership, and track team compliance coverage.</p>
      </div>
      <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm"><i class="bi bi-plus-circle me-1"></i> Add Team</button>
    </div>

    <div class="card cms-card mb-3" *ngIf="showCreateForm">
      <div class="card-body">
        <form [formGroup]="createForm" (ngSubmit)="createTeam()" class="row g-2">
          <div class="col-md-6">
            <input class="form-control" placeholder="Team name" formControlName="name" />
          </div>
          <div class="col-md-4">
            <input class="form-control" type="number" placeholder="Lead User ID (optional)" formControlName="leadUserId" />
          </div>
          <div class="col-md-2 d-grid">
            <button class="btn btn-primary" type="submit" [disabled]="createForm.invalid">Create</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-header"><h6 class="card-title mb-0">All Teams</h6></div>
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        <div class="table-responsive">
          <table class="table cms-table mb-0">
            <thead><tr><th>Team</th><th>Lead</th><th>Members</th><th>Status</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let t of teams()">
                <td class="fw-semibold">{{ teamName(t) }}</td>
                <td>{{ leadName(t) }}</td>
                <td>{{ memberCount(t) }}</td>
                <td><span class="badge" [class]="statusClass(t)">{{ statusText(t) }}</span></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-danger" (click)="archiveTeam(teamId(t))" [disabled]="isArchived(t)">Archive</button>
                </td>
              </tr>
              <tr *ngIf="!teams().length"><td colspan="5" class="text-center py-4 text-muted">No teams found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private fb = inject(FormBuilder);

  teams = signal<Team[]>([]);
  loading = signal(false);
  showCreateForm = false;

  createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    leadUserId: [null as number | null]
  });

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading.set(true);
    this.teamService.list().subscribe({
      next: (res) => {
        if (res.isSuccess) this.teams.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createTeam(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const values = this.createForm.getRawValue();
    this.teamService.create({
      Name: values.name ?? '',
      LeadUserId: values.leadUserId ?? undefined
    }).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        this.createForm.reset({ name: '', leadUserId: null });
        this.showCreateForm = false;
        this.loadTeams();
      }
    });
  }

  archiveTeam(id: number): void {
    if (!id) return;
    this.teamService.archive(id).subscribe({
      next: () => this.loadTeams()
    });
  }

  teamId(team: Team): number {
    const item = team as Team & { id?: number };
    return team.Id ?? item.id ?? 0;
  }

  teamName(team: Team): string {
    const item = team as Team & { name?: string };
    return team.Name ?? item.name ?? '-';
  }

  leadName(team: Team): string {
    const item = team as Team & { leadName?: string };
    return team.LeadName ?? item.leadName ?? 'Unassigned';
  }

  memberCount(team: Team): number {
    const item = team as Team & { memberCount?: number };
    return team.MemberCount ?? item.memberCount ?? 0;
  }

  isArchived(team: Team): boolean {
    const item = team as Team & { isArchived?: boolean };
    return team.IsArchived ?? item.isArchived ?? false;
  }

  statusText(team: Team): string {
    return this.isArchived(team) ? 'Archived' : 'Active';
  }

  statusClass(team: Team): string {
    return this.isArchived(team) ? 'bg-secondary' : 'bg-success';
  }
}
