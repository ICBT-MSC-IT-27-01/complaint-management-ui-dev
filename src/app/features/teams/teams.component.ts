import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PagedResult } from '@core/models/api-response.model';
import { User } from '@core/models/user.model';
import {
  Team,
  TeamMember,
  TeamSearchRequest,
  CreateTeamRequest,
  UpdateTeamRequest
} from '@core/models/team.model';
import { TeamService } from '@core/services/team.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Teams Management</h2>
        <p class="page-sub">Organize departments, assign leadership, and track team coverage.</p>
      </div>
      <button class="btn btn-primary" (click)="startCreate()">
        <i class="bi bi-plus-circle me-1"></i> Add Team
      </button>
    </div>

    <div class="cms-kpi-grid">
      <div class="kpi-card kpi-blue"><div class="kpi-body"><div class="kpi-label">Total Teams</div><div class="kpi-value">{{ result()?.totalCount || 0 }}</div></div></div>
      <div class="kpi-card kpi-orange"><div class="kpi-body"><div class="kpi-label">Total Members</div><div class="kpi-value">{{ totalMembers() }}</div></div></div>
      <div class="kpi-card kpi-green"><div class="kpi-body"><div class="kpi-label">Active Leads</div><div class="kpi-value">{{ activeLeadCount() }}</div></div></div>
      <div class="kpi-card kpi-green"><div class="kpi-body"><div class="kpi-label">Active Teams</div><div class="kpi-value">{{ activeTeams() }}</div></div></div>
    </div>

    <div class="cms-filterbar mb-3">
      <div class="card-body p-0">
        <div class="row g-2">
          <div class="col-md-5">
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Search by team name or code..."
              [(ngModel)]="req.q"
              (keyup.enter)="applyFilters()"
            />
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="activeFilter">
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary btn-sm" (click)="applyFilters()"><i class="bi bi-search me-1"></i>Filter</button>
            <button class="btn btn-outline-secondary btn-sm ms-1" (click)="clearFilters()">Clear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card cms-card mb-3" *ngIf="showForm()">
      <div class="card-header">
        <h6 class="card-title mb-0">{{ editingId() ? 'Edit Team' : 'Create Team' }}</h6>
      </div>
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="save()" class="row g-3">
          <div class="col-md-5">
            <label class="form-label fw-medium">Team Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" formControlName="teamName" />
          </div>
          <div class="col-md-4">
            <label class="form-label fw-medium">Lead Supervisor <span class="text-danger">*</span></label>
            <select class="form-select" formControlName="leadUserId">
              <option [ngValue]="null">Select supervisor...</option>
              <option *ngFor="let s of supervisors()" [ngValue]="userId(s)">{{ userName(s) }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-medium">Status</label>
            <select class="form-select" formControlName="isActive" [disabled]="!editingId()">
              <option [ngValue]="true">Active</option>
              <option [ngValue]="false">Inactive</option>
            </select>
          </div>
          <div class="col-12">
            <div class="alert alert-danger py-2" *ngIf="errorMsg()">{{ errorMsg() }}</div>
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-sm" type="submit" [disabled]="form.invalid || submitting()">
                <span *ngIf="submitting()" class="spinner-border spinner-border-sm me-1"></span>{{ editingId() ? 'Update' : 'Create' }}
              </button>
              <button class="btn btn-outline-secondary btn-sm" type="button" (click)="cancelEdit()">Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
        <div class="table-responsive" *ngIf="!loading()">
          <table class="table table-hover cms-table mb-0">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Lead</th><th>Members</th><th>Status</th><th>Created</th><th class="text-end">Actions</th></tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let t of result()?.items">
                <tr>
                  <td><code class="text-primary">{{ teamCode(t) }}</code></td>
                  <td class="fw-medium">{{ teamName(t) }}</td>
                  <td>{{ leadName(t) }}</td>
                  <td>{{ memberCount(t) }}</td>
                  <td>
                    <span class="badge" [class]="isActive(t) ? 'bg-success' : 'bg-secondary'">
                      {{ isActive(t) ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="small text-muted">{{ createdAt(t) ? (createdAt(t) | date:'MMM d, y, h:mm a') : '—' }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-info me-1" (click)="toggleMembers(t)">
                      {{ expandedTeamId() === teamId(t) ? 'Hide Members' : 'Members' }}
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" (click)="edit(t)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteTeam(t)"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
                <tr *ngIf="expandedTeamId() === teamId(t)">
                  <td colspan="7" class="bg-light">
                    <div class="p-2">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">Team Members</h6>
                        <div class="input-group input-group-sm" style="max-width: 300px;">
                          <select
                            class="form-select"
                            [ngModel]="memberUserId(teamId(t))"
                            (ngModelChange)="setMemberUserId(teamId(t), $event)"
                            [ngModelOptions]="{ standalone: true }">
                            <option [ngValue]="null">Select eligible user...</option>
                            <option *ngFor="let u of availableMembersForTeam(t)" [ngValue]="userId(u)">
                              {{ userName(u) }} ({{ userRole(u) || 'User' }})
                            </option>
                          </select>
                          <button class="btn btn-success" type="button" (click)="addMember(t)" [disabled]="memberSubmitting()">
                            <span *ngIf="memberSubmitting()" class="spinner-border spinner-border-sm me-1"></span>Add
                          </button>
                        </div>
                      </div>

                      <div class="table-responsive">
                        <table class="table table-sm mb-0">
                          <thead><tr><th>User</th><th>Email</th><th>Role</th><th></th></tr></thead>
                          <tbody>
                            <tr *ngFor="let m of membersOf(t)">
                              <td>{{ memberName(m) }}</td>
                              <td>{{ memberEmail(m) }}</td>
                              <td>{{ memberRole(m) }}</td>
                              <td class="text-end">
                                <button class="btn btn-sm btn-outline-danger" type="button" (click)="removeMember(t, m)">Remove</button>
                              </td>
                            </tr>
                            <tr *ngIf="!membersOf(t).length">
                              <td colspan="4" class="text-center text-muted py-2">No members assigned</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="alert alert-danger py-2 mt-2 mb-0" *ngIf="memberError(teamId(t))">{{ memberError(teamId(t)) }}</div>
                    </div>
                  </td>
                </tr>
              </ng-container>
              <tr *ngIf="!result()?.items?.length">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="bi bi-diagram-3 fs-3 d-block mb-2"></i>No teams found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top" *ngIf="result()">
          <small class="text-muted">{{ result()!.totalCount }} teams found</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="req.page === 1" (click)="changePage(-1)"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-outline-secondary" [disabled]="req.page! >= result()!.totalPages" (click)="changePage(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TeamsComponent implements OnInit {
  private svc = inject(TeamService);
  private userSvc = inject(UserService);
  private fb = inject(FormBuilder);

  result = signal<PagedResult<Team> | null>(null);
  supervisors = signal<User[]>([]);
  memberUsers = signal<User[]>([]);
  loading = signal(false);
  submitting = signal(false);
  memberSubmitting = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  expandedTeamId = signal<number | null>(null);
  errorMsg = signal('');
  teamDetails = signal<Record<number, Team>>({});
  memberInput = signal<Record<number, number | null>>({});
  memberErrors = signal<Record<number, string>>({});
  activeFilter = '';
  req: TeamSearchRequest = { page: 1, pageSize: 15 };

  form = this.fb.group({
    teamName: ['', [Validators.required, Validators.minLength(2)]],
    leadUserId: [null as number | null, Validators.required],
    isActive: [true, Validators.required]
  });

  ngOnInit(): void {
    this.loadSupervisors();
    this.loadMemberUsers();
    this.load();
  }

  private loadSupervisors(): void {
    this.userSvc.search({ Role: 'Supervisor', IsActive: true, Page: 1, PageSize: 200 }).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        const activeSupervisors = (res.data.items ?? []).filter((u) => this.userIsActive(u) && this.userRole(u) === 'Supervisor');
        this.supervisors.set(activeSupervisors);
      }
    });
  }

  private loadMemberUsers(): void {
    this.userSvc.search({ IsActive: true, Page: 1, PageSize: 500 }).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        this.memberUsers.set(
          (res.data.items ?? []).filter((u) => {
            if (!this.userIsActive(u)) return false;
            const role = this.userRole(u);
            return role === 'Agent' || role === 'Supervisor';
          })
        );
      }
    });
  }

  applyFilters(): void {
    this.req.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.req = { page: 1, pageSize: 15 };
    this.activeFilter = '';
    this.load();
  }

  changePage(delta: number): void {
    this.req.page = (this.req.page ?? 1) + delta;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.search({
      ...this.req,
      q: String(this.req.q ?? '').trim() || undefined,
      isActive: this.activeFilter === '' ? null : this.activeFilter === 'true'
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) this.result.set(this.normalizePagedTeams(res.data));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startCreate(): void {
    this.showForm.set(true);
    this.editingId.set(null);
    this.errorMsg.set('');
    this.form.reset({ teamName: '', leadUserId: null, isActive: true });
  }

  cancelEdit(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.errorMsg.set('');
  }

  edit(team: Team): void {
    const id = this.teamId(team);
    if (!id) return;
    this.showForm.set(true);
    this.editingId.set(id);
    this.errorMsg.set('');
    this.submitting.set(true);

    this.svc.getById(id).subscribe({
      next: (res) => {
        const loaded = res.isSuccess ? res.data : team;
        this.form.reset({
          teamName: this.teamName(loaded),
          leadUserId: this.leadUserId(loaded),
          isActive: this.isActive(loaded)
        });
        if (res.isSuccess) this.storeTeamDetail(loaded);
        this.submitting.set(false);
      },
      error: () => {
        this.form.reset({
          teamName: this.teamName(team),
          leadUserId: this.leadUserId(team),
          isActive: this.isActive(team)
        });
        this.submitting.set(false);
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.editingId();
    const values = this.form.getRawValue();
    this.errorMsg.set('');
    this.submitting.set(true);

    if (!id) {
      const payload: CreateTeamRequest = {
        TeamName: values.teamName ?? '',
        LeadUserId: values.leadUserId ?? undefined
      };
      this.svc.create(payload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (!res.isSuccess) {
            this.errorMsg.set(res.message || 'Unable to create team.');
            return;
          }
          this.cancelEdit();
          this.load();
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Unable to create team.');
          this.submitting.set(false);
        }
      });
      return;
    }

    const payload: UpdateTeamRequest = {
      TeamName: values.teamName ?? '',
      LeadUserId: values.leadUserId ?? undefined,
      IsActive: values.isActive ?? true
    };
    this.svc.update(id, payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (!res.isSuccess) {
          this.errorMsg.set(res.message || 'Unable to update team.');
          return;
        }
        this.cancelEdit();
        this.load();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Unable to update team.');
        this.submitting.set(false);
      }
    });
  }

  deleteTeam(team: Team): void {
    const id = this.teamId(team);
    if (!id) return;
    if (!confirm(`Delete team "${this.teamName(team)}"?`)) return;
    this.svc.delete(id).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        if (this.expandedTeamId() === id) this.expandedTeamId.set(null);
        this.load();
      }
    });
  }

  toggleMembers(team: Team): void {
    const id = this.teamId(team);
    if (!id) return;
    if (this.expandedTeamId() === id) {
      this.expandedTeamId.set(null);
      return;
    }
    this.expandedTeamId.set(id);
    this.setMemberError(id, '');
    this.loadTeamDetail(id);
  }

  addMember(team: Team): void {
    const id = this.teamId(team);
    const userId = this.memberUserId(id);
    if (!id || !userId || userId <= 0) return;
    this.setMemberError(id, '');
    this.memberSubmitting.set(true);
    this.svc.addMember(id, { UserId: userId }).subscribe({
      next: (res) => {
        this.memberSubmitting.set(false);
        if (!res.isSuccess) {
          this.setMemberError(id, res.message || 'Unable to add member.');
          return;
        }
        this.setMemberUserId(id, null);
        this.loadTeamDetail(id);
      },
      error: (err) => {
        this.memberSubmitting.set(false);
        this.setMemberError(id, err?.error?.message || 'Unable to add member.');
      }
    });
  }

  removeMember(team: Team, member: TeamMember): void {
    const id = this.teamId(team);
    const userId = this.memberId(member);
    if (!id || !userId) return;
    if (!confirm(`Remove user ${userId} from this team?`)) return;
    this.memberSubmitting.set(true);
    this.svc.removeMember(id, userId).subscribe({
      next: (res) => {
        this.memberSubmitting.set(false);
        if (!res.isSuccess) return;
        this.loadTeamDetail(id);
      },
      error: () => this.memberSubmitting.set(false)
    });
  }

  private loadTeamDetail(id: number): void {
    this.svc.getById(id).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        this.storeTeamDetail(res.data);
        this.replaceTeamInList(res.data);
      }
    });
  }

  private storeTeamDetail(team: Team): void {
    const id = this.teamId(team);
    if (!id) return;
    this.teamDetails.update((current) => ({ ...current, [id]: team }));
  }

  private replaceTeamInList(updated: Team): void {
    const id = this.teamId(updated);
    const current = this.result();
    if (!current || !id) return;
    const nextItems = current.items.map((t) => this.teamId(t) === id ? updated : t);
    this.result.set({ ...current, items: nextItems });
  }

  setMemberUserId(teamId: number, value: string | number | null): void {
    const n = typeof value === 'number' ? value : Number(value);
    this.memberInput.update((state) => ({ ...state, [teamId]: Number.isFinite(n) && n > 0 ? n : null }));
  }

  memberUserId(teamId: number): number | null {
    return this.memberInput()[teamId] ?? null;
  }

  membersOf(team: Team): TeamMember[] {
    const id = this.teamId(team);
    const detail = id ? this.teamDetails()[id] : null;
    const source = detail ?? team;
    return source.Members ?? source.members ?? [];
  }

  teamId(team: Team): number {
    return team.Id ?? team.id ?? 0;
  }

  teamCode(team: Team): string {
    return team.TeamCode ?? team.teamCode ?? '-';
  }

  teamName(team: Team): string {
    return team.TeamName ?? team.teamName ?? '-';
  }

  leadUserId(team: Team): number | null {
    return team.LeadUserId ?? team.leadUserId ?? null;
  }

  leadName(team: Team): string {
    return team.LeadName ?? team.leadName ?? 'Unassigned';
  }

  memberCount(team: Team): number {
    return team.MemberCount ?? team.memberCount ?? this.membersOf(team).length;
  }

  isActive(team: Team): boolean {
    return team.IsActive ?? team.isActive ?? false;
  }

  createdAt(team: Team): string | null {
    return team.CreatedDateTime ?? team.createdDateTime ?? null;
  }

  memberId(member: TeamMember): number {
    return member.UserId ?? member.userId ?? 0;
  }

  memberName(member: TeamMember): string {
    return member.Name ?? member.name ?? '-';
  }

  memberEmail(member: TeamMember): string {
    return member.Email ?? member.email ?? '-';
  }

  memberRole(member: TeamMember): string {
    return member.Role ?? member.role ?? '-';
  }

  private normalizePagedTeams(raw: unknown): PagedResult<Team> {
    const fallback: PagedResult<Team> = { page: 1, pageSize: 15, totalCount: 0, totalPages: 0, items: [] };
    if (!raw || typeof raw !== 'object') return fallback;

    const data = raw as Record<string, unknown>;
    const rawItems = data['items'] ?? data['Items'];
    const items = Array.isArray(rawItems) ? (rawItems as Team[]) : [];
    const page = Number(data['page'] ?? data['Page'] ?? 1);
    const pageSize = Number(data['pageSize'] ?? data['PageSize'] ?? this.req.pageSize ?? 15);
    const totalCount = Number(data['totalCount'] ?? data['TotalCount'] ?? items.length);
    const totalPages = Number(data['totalPages'] ?? data['TotalPages'] ?? (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1));

    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 15,
      totalCount: Number.isFinite(totalCount) && totalCount >= 0 ? totalCount : 0,
      totalPages: Number.isFinite(totalPages) && totalPages >= 0 ? totalPages : 0,
      items
    };
  }

  userId(user: User): number {
    const item = user as User & { id?: number };
    return user.Id ?? item.id ?? 0;
  }

  userName(user: User): string {
    const item = user as User & { name?: string };
    return user.Name ?? item.name ?? '-';
  }

  userRole(user: User): string {
    const item = user as User & { role?: string };
    return user.Role ?? item.role ?? '';
  }

  userIsActive(user: User): boolean {
    const item = user as User & { isActive?: boolean };
    return user.IsActive ?? item.isActive ?? false;
  }

  availableMembersForTeam(team: Team): User[] {
    const existing = new Set(this.membersOf(team).map((m) => this.memberId(m)).filter((id) => id > 0));
    return this.memberUsers().filter((u) => !existing.has(this.userId(u)));
  }

  memberError(teamId: number): string {
    return this.memberErrors()[teamId] ?? '';
  }

  private setMemberError(teamId: number, message: string): void {
    this.memberErrors.update((state) => ({ ...state, [teamId]: message }));
  }

  totalMembers(): number {
    return (this.result()?.items ?? []).reduce((total, team) => total + this.memberCount(team), 0);
  }

  activeTeams(): number {
    return (this.result()?.items ?? []).filter((team) => this.isActive(team)).length;
  }

  activeLeadCount(): number {
    const leads = new Set((this.result()?.items ?? []).map((team) => this.leadName(team)).filter((name) => !!name && name !== 'Unassigned'));
    return leads.size;
  }
}
