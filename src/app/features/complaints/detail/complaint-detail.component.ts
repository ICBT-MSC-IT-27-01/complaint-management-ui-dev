import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComplaintService } from '@core/services/complaint.service';
import { AuthService } from '@core/services/auth.service';
import { Complaint, ComplaintHistory, ComplaintSlaTimer } from '@core/models/complaint.model';

@Component({
  selector: 'app-complaint-detail',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, ReactiveFormsModule],
  template: `
    <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

    <ng-container *ngIf="complaint() as c">
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h2 class="cmp-title mb-1">#{{ c.ComplaintNumber }}</h2>
          <p class="cmp-subtitle mb-0">{{ c.Subject }}</p>
        </div>
        <span class="status-pill">{{ c.Status }}</span>
      </div>

      <div class="row g-3 align-items-start">
        <div class="col-xl-3 col-lg-4">
          <div class="card cms-card h-100">
            <div class="card-body">
              <h4 class="fw-bold mb-3">{{ c.ClientName || 'Unknown Client' }}</h4>
              <p class="mb-2"><i class="bi bi-envelope me-2"></i>{{ c.ClientEmail || '-' }}</p>
              <p class="mb-2"><i class="bi bi-telephone me-2"></i>{{ c.ClientMobile || '-' }}</p>
              <p class="mb-4"><i class="bi bi-geo-alt me-2"></i>Location not available</p>
              <h5 class="fw-bold mb-2">Original Complaint</h5>
              <p class="text-muted mb-0">{{ c.Description }}</p>
            </div>
          </div>
        </div>

        <div class="col-xl-6 col-lg-8">
          <div class="card cms-card mb-3" *ngIf="auth.hasRole('Admin','Supervisor','Agent')">
            <div class="card-body">
              <h5 class="fw-bold mb-3">Internal Note</h5>
              <form [formGroup]="noteForm" (ngSubmit)="postInternalNote()">
                <textarea class="form-control mb-3" rows="4" formControlName="note" placeholder="Add internal note..."></textarea>
                <div class="text-end"><button class="btn btn-primary" type="submit" [disabled]="noteForm.invalid">Post Internal Note</button></div>
              </form>
            </div>
          </div>

          <div class="card cms-card mb-3" *ngFor="let item of history()">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="fw-bold mb-0">{{ item.PerformedByName }}</h5>
                <span class="text-muted">{{ item.CreatedDateTime | date:'shortTime' }}</span>
              </div>
              <span class="badge bg-light text-secondary border">{{ item.Action }}</span>
              <p class="mb-0 mt-2 fs-5 text-dark">{{ item.Note || (item.OldStatus && item.NewStatus ? (item.OldStatus + ' -> ' + item.NewStatus) : 'Activity logged.') }}</p>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-12">
          <div class="card cms-card mb-3">
            <div class="card-body">
              <h4 class="fw-bold mb-3">SLA Timer</h4>
              <p class="mb-1">
                <span class="badge" [class]="slaTimer()?.isBreached ? 'bg-danger' : 'bg-success'">
                  {{ slaTimer()?.isBreached ? 'Breached' : 'On Track' }}
                </span>
              </p>
              <p class="mb-1 text-muted">{{ slaStatusText() }}</p>
              <small class="text-muted" *ngIf="slaTimer()?.dueDateUtc">Due: {{ slaTimer()?.dueDateUtc | date:'medium' }}</small>
            </div>
          </div>

          <div class="card cms-card">
            <div class="card-body">
              <h4 class="fw-bold mb-3">Current Status</h4>
              <div class="d-grid gap-2">
                <button class="btn status-btn" [class.status-btn-active]="c.ComplaintStatusId===3" (click)="changeStatus(3, 'In Progress')">In Progress</button>
                <button class="btn status-btn" [class.status-btn-active]="c.ComplaintStatusId===4" (click)="changeStatus(4, 'Waiting for Client')">Waiting for Client</button>
                <button class="btn status-btn status-btn-success" [class.status-btn-success-active]="c.ComplaintStatusId===5" (click)="changeStatus(5, 'Resolved')">Resolved</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .cmp-title { font-size: 3rem; font-weight: 800; letter-spacing: -0.03em; }
    .cmp-subtitle { color: #5c6f8f; font-size: 1.8rem; }
    .status-pill { background: #fdf0d7; color: #9a6400; border-radius: 999px; padding: 0.4rem 1rem; font-weight: 600; font-size: 1.5rem; }
    .status-btn { border: 1px solid #8ca0c0; color: #4c5f7f; background: #fff; font-size: 1.7rem; padding: 0.8rem 1rem; }
    .status-btn-active { border-color: #1b4fd8; color: #1b4fd8; }
    .status-btn-success { border-color: #3fa56d; color: #0c8a49; }
    .status-btn-success-active { background: #e7f8ef; }
  `]
})
export class ComplaintDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private complaintSvc = inject(ComplaintService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  complaint = signal<Complaint | null>(null);
  history = signal<ComplaintHistory[]>([]);
  slaTimer = signal<ComplaintSlaTimer | null>(null);
  loading = signal(true);

  noteForm = this.fb.group({ note: ['', Validators.required] });

  ngOnInit(): void {
    const routeValue = this.route.snapshot.paramMap.get('id') ?? '';
    if (!routeValue) {
      this.loading.set(false);
      return;
    }

    const numericId = Number(routeValue);
    if (!Number.isNaN(numericId) && numericId > 0) {
      this.loadAll(numericId);
      return;
    }

    this.complaintSvc.search({ Q: routeValue, Page: 1, PageSize: 20 }).subscribe({
      next: (res) => {
        if (!res.isSuccess) { this.loading.set(false); return; }
        const match = res.data.items.find((x) => this.complaintNumber(x).toLowerCase() === routeValue.toLowerCase());
        if (!match) { this.loading.set(false); return; }
        this.loadAll(this.complaintId(match));
      },
      error: () => this.loading.set(false)
    });
  }

  loadAll(id: number): void {
    this.loading.set(true);
    this.complaintSvc.getById(id).subscribe({
      next: (r) => {
        if (r.isSuccess) this.complaint.set(this.normalizeComplaint(r.data));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.complaintSvc.getHistory(id).subscribe({
      next: (r) => { if (r.isSuccess) this.history.set((r.data ?? []).map((h) => this.normalizeHistory(h))); }
    });

    this.complaintSvc.getSlaTimer(id).subscribe({
      next: (r) => {
        if (!r.isSuccess) return;
        this.slaTimer.set(this.normalizeSla(r.data));
      }
    });
  }

  postInternalNote(): void {
    const c = this.complaint();
    if (!c || this.noteForm.invalid) return;

    const note = this.noteForm.getRawValue().note ?? '';
    this.complaintSvc.updateStatus(c.Id, { StatusId: c.ComplaintStatusId, Note: note }).subscribe({
      next: () => {
        this.noteForm.reset();
        this.loadAll(c.Id);
      }
    });
  }

  changeStatus(statusId: number, label: string): void {
    const c = this.complaint();
    if (!c || !this.auth.hasRole('Admin', 'Supervisor', 'Agent')) return;

    this.complaintSvc.updateStatus(c.Id, { StatusId: statusId, Note: `Status changed to ${label}` }).subscribe({
      next: () => this.loadAll(c.Id)
    });
  }

  private complaintId(c: Complaint): number {
    const item = c as Complaint & { id?: number };
    return c.Id ?? item.id ?? 0;
  }

  private complaintNumber(c: Complaint): string {
    const item = c as Complaint & { complaintNumber?: string };
    return c.ComplaintNumber ?? item.complaintNumber ?? '';
  }

  private normalizeComplaint(c: Complaint): Complaint {
    const item = c as Complaint & {
      id?: number;
      complaintNumber?: string;
      subject?: string;
      description?: string;
      priority?: string;
      status?: string;
      complaintStatusId?: number;
      complaintChannelId?: number;
      channel?: string;
      complaintCategoryId?: number;
      category?: string;
      subCategoryId?: number;
      clientId?: number;
      clientName?: string;
      clientEmail?: string;
      clientMobile?: string;
      assignedToUserId?: number;
      assignedToName?: string;
      assignedDate?: string;
      dueDate?: string;
      slaStatus?: string;
      isSlaBreached?: boolean;
      isResolved?: boolean;
      resolvedDate?: string;
      resolutionNotes?: string;
      isClosed?: boolean;
      closedDate?: string;
      createdDateTime?: string;
      createdBy?: number;
      createdByName?: string;
      updatedDateTime?: string;
      isActive?: boolean;
    };

    return {
      Id: c.Id ?? item.id ?? 0,
      ComplaintNumber: c.ComplaintNumber ?? item.complaintNumber ?? '-',
      Subject: c.Subject ?? item.subject ?? '',
      Description: c.Description ?? item.description ?? '',
      Priority: c.Priority ?? item.priority ?? '-',
      Status: c.Status ?? item.status ?? '-',
      ComplaintStatusId: c.ComplaintStatusId ?? item.complaintStatusId ?? 0,
      ComplaintChannelId: c.ComplaintChannelId ?? item.complaintChannelId ?? 0,
      Channel: c.Channel ?? item.channel ?? '',
      ComplaintCategoryId: c.ComplaintCategoryId ?? item.complaintCategoryId ?? 0,
      Category: c.Category ?? item.category ?? '',
      SubCategoryId: c.SubCategoryId ?? item.subCategoryId,
      ClientId: c.ClientId ?? item.clientId,
      ClientName: c.ClientName ?? item.clientName,
      ClientEmail: c.ClientEmail ?? item.clientEmail,
      ClientMobile: c.ClientMobile ?? item.clientMobile,
      AssignedToUserId: c.AssignedToUserId ?? item.assignedToUserId,
      AssignedToName: c.AssignedToName ?? item.assignedToName,
      AssignedDate: c.AssignedDate ?? item.assignedDate,
      DueDate: c.DueDate ?? item.dueDate,
      SlaStatus: c.SlaStatus ?? item.slaStatus ?? '',
      IsSlaBreached: c.IsSlaBreached ?? item.isSlaBreached ?? false,
      IsResolved: c.IsResolved ?? item.isResolved ?? false,
      ResolvedDate: c.ResolvedDate ?? item.resolvedDate,
      ResolutionNotes: c.ResolutionNotes ?? item.resolutionNotes,
      IsClosed: c.IsClosed ?? item.isClosed ?? false,
      ClosedDate: c.ClosedDate ?? item.closedDate,
      CreatedDateTime: c.CreatedDateTime ?? item.createdDateTime ?? '',
      CreatedBy: c.CreatedBy ?? item.createdBy ?? 0,
      CreatedByName: c.CreatedByName ?? item.createdByName ?? '',
      UpdatedDateTime: c.UpdatedDateTime ?? item.updatedDateTime,
      IsActive: c.IsActive ?? item.isActive ?? true
    };
  }

  private normalizeHistory(h: ComplaintHistory): ComplaintHistory {
    const item = h as ComplaintHistory & {
      id?: number;
      action?: string;
      oldStatus?: string;
      newStatus?: string;
      note?: string;
      performedByName?: string;
      createdDateTime?: string;
    };

    return {
      Id: h.Id ?? item.id ?? 0,
      Action: h.Action ?? item.action ?? 'Updated',
      OldStatus: h.OldStatus ?? item.oldStatus,
      NewStatus: h.NewStatus ?? item.newStatus,
      Note: h.Note ?? item.note,
      PerformedByName: h.PerformedByName ?? item.performedByName ?? 'System',
      CreatedDateTime: h.CreatedDateTime ?? item.createdDateTime ?? new Date().toISOString()
    };
  }

  slaStatusText(): string {
    const timer = this.slaTimer();
    if (!timer) return 'Not available';
    if (timer.remainingText) return timer.remainingText;
    if (typeof timer.remainingMinutes === 'number') return `${timer.remainingMinutes} min remaining`;
    if (timer.status) return timer.status;
    return 'Not available';
  }

  private normalizeSla(value: ComplaintSlaTimer): ComplaintSlaTimer {
    const item = value as ComplaintSlaTimer & {
      ComplaintId?: number;
      ComplaintNumber?: string;
      DueDateUtc?: string;
      RemainingMinutes?: number;
      RemainingText?: string;
      ElapsedMinutes?: number;
      IsBreached?: boolean;
      Status?: string;
    };

    return {
      complaintId: value.complaintId ?? item.ComplaintId,
      complaintNumber: value.complaintNumber ?? item.ComplaintNumber,
      dueDateUtc: value.dueDateUtc ?? item.DueDateUtc,
      remainingMinutes: value.remainingMinutes ?? item.RemainingMinutes,
      remainingText: value.remainingText ?? item.RemainingText,
      elapsedMinutes: value.elapsedMinutes ?? item.ElapsedMinutes,
      isBreached: value.isBreached ?? item.IsBreached,
      status: value.status ?? item.Status
    };
  }
}
