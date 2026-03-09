import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '@core/services/client.service';
import { AuthService } from '@core/services/auth.service';
import { Client } from '@core/models/client.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink],
  template: `
    <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    <ng-container *ngIf="client() as c">
      <div class="page-header">
        <div>
          <a routerLink="/clients" class="text-muted small d-block mb-1"><i class="bi bi-arrow-left me-1"></i>Back</a>
          <h2 class="page-title">{{ c.companyName }}</h2>
          <p class="page-sub">{{ c.clientCode }}</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge fs-6" [class]="c.isActive ? 'bg-success' : 'bg-secondary'">{{ c.isActive ? 'Active' : 'Inactive' }}</span>
          <a *ngIf="auth.hasRole('Admin','Supervisor')" [routerLink]="['/clients', c.id, 'edit']" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-pencil me-1"></i>Edit
          </a>
          <button *ngIf="auth.hasRole('Admin','Supervisor')" type="button" class="btn btn-sm btn-outline-danger" [disabled]="deleting()" (click)="remove()">
            <span *ngIf="deleting()" class="spinner-border spinner-border-sm me-1"></span>
            <i *ngIf="!deleting()" class="bi bi-trash me-1"></i>Delete
          </button>
        </div>
      </div>
      <div class="card cms-card" style="max-width:700px">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-sm-6"><label class="detail-label">Client Code</label><div class="detail-value"><code>{{ c.clientCode }}</code></div></div>
            <div class="col-sm-6"><label class="detail-label">Type</label><div class="detail-value">{{ c.clientType }}</div></div>
            <div class="col-sm-6"><label class="detail-label">Email</label><div class="detail-value">{{ c.primaryEmail }}</div></div>
            <div class="col-sm-6"><label class="detail-label">Phone</label><div class="detail-value">{{ c.primaryPhone || '—' }}</div></div>
            <div class="col-sm-6"><label class="detail-label">Account Manager</label><div class="detail-value">{{ c.accountManagerName || '—' }}</div></div>
            <div class="col-sm-6"><label class="detail-label">Created</label><div class="detail-value">{{ c.createdDateTime | date:'medium' }}</div></div>
            <div class="col-12"><label class="detail-label">Address</label><div class="detail-value">{{ c.address || '—' }}</div></div>
          </div>
        </div>
      </div>
    </ng-container>
  `
})
export class ClientDetailComponent implements OnInit {
  @Input() id!: string;
  private svc = inject(ClientService);
  private router = inject(Router);
  auth = inject(AuthService);
  client = signal<Client | null>(null);
  loading = signal(true);
  deleting = signal(false);
  ngOnInit(): void {
    this.svc.getById(+this.id).subscribe(r => { if (r.isSuccess) this.client.set(r.data); this.loading.set(false); });
  }

  remove(): void {
    const current = this.client();
    if (!current) return;
    if (!confirm('Delete this client? This action cannot be undone.')) return;
    this.deleting.set(true);
    this.svc.delete(current.id).subscribe({
      next: res => {
        this.deleting.set(false);
        if (res.isSuccess) this.router.navigate(['/clients']);
      },
      error: () => this.deleting.set(false)
    });
  }
}
