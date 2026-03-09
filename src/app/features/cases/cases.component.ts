import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '@core/services/case.service';
import { AuthService } from '@core/services/auth.service';
import { Case, CaseActivity } from '@core/models/case.model';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Case Detail</h2><p class="page-sub">Case activities and status</p></div>
    </div>
    <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    <ng-container *ngIf="caseData() as c">
      <div class="row g-3">
        <div class="col-lg-8">
          <div class="card cms-card mb-3">
            <div class="card-header"><h6 class="card-title mb-0">{{ c.caseNumber }}</h6></div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-sm-6"><label class="detail-label">Status</label><div class="detail-value"><span class="badge bg-primary">{{ c.status }}</span></div></div>
                <div class="col-sm-6"><label class="detail-label">Assigned To</label><div class="detail-value">{{ c.assignedToUserName || '—' }}</div></div>
                <div class="col-sm-6"><label class="detail-label">Opened</label><div class="detail-value">{{ c.openedAt | date:'medium' }}</div></div>
                <div class="col-sm-6"><label class="detail-label">Closed</label><div class="detail-value">{{ c.closedAt ? (c.closedAt | date:'medium') : 'Open' }}</div></div>
                <div class="col-12" *ngIf="c.notes"><label class="detail-label">Notes</label><div class="detail-value">{{ c.notes }}</div></div>
              </div>
            </div>
          </div>
          <div class="card cms-card">
            <div class="card-header"><h6 class="card-title mb-0">Activities</h6></div>
            <div class="card-body p-0">
              <div class="activity-feed">
                <div class="activity-item" *ngFor="let a of activities()">
                  <div class="activity-dot"></div>
                  <div class="activity-body">
                    <div class="activity-type badge bg-light text-dark">{{ a.activityType }}</div>
                    <p class="activity-desc">{{ a.description }}</p>
                    <div class="activity-meta">{{ a.performedByName }} · {{ a.createdDateTime | date:'MMM d, h:mm a' }}</div>
                  </div>
                </div>
                <p class="text-muted small text-center py-3" *ngIf="!activities().length">No activities yet</p>
              </div>
              <div class="p-3 border-top" *ngIf="auth.hasRole('Admin','Supervisor','Agent')">
                <form [formGroup]="actForm" (ngSubmit)="addActivity()">
                  <select class="form-select form-select-sm mb-2" formControlName="activityType">
                    <option>Note</option><option>Call</option><option>Email</option>
                  </select>
                  <textarea class="form-control form-control-sm mb-2" formControlName="description" rows="2" placeholder="Activity note..."></textarea>
                  <button type="submit" class="btn btn-sm btn-primary">Log Activity</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `
})
export class CasesComponent implements OnInit {
  @Input() id!: string;
  private route = inject(ActivatedRoute);
  private svc = inject(CaseService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  caseData = signal<Case | null>(null);
  activities = signal<CaseActivity[]>([]);
  loading = signal(true);
  actForm = this.fb.group({ activityType: ['Note'], description: ['', Validators.required] });

  ngOnInit(): void {
    if (!this.id) this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id) {
      this.svc.getById(+this.id).subscribe(r => { if (r.isSuccess) this.caseData.set(r.data); this.loading.set(false); });
      this.svc.getActivities(+this.id).subscribe(r => { if (r.isSuccess) this.activities.set(r.data); });
    } else { this.loading.set(false); }
  }

  addActivity(): void {
    if (this.actForm.invalid || !this.id) return;
    this.svc.addActivity(+this.id, this.actForm.value as any).subscribe(() => {
      this.svc.getActivities(+this.id).subscribe(r => { if (r.isSuccess) this.activities.set(r.data); });
      this.actForm.reset({ activityType: 'Note', description: '' });
    });
  }
}
