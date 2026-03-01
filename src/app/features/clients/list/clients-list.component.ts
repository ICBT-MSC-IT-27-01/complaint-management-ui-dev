import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '@core/services/client.service';
import { AuthService } from '@core/services/auth.service';
import { Client, ClientSearchRequest } from '@core/models/client.model';
import { PagedResult } from '@core/models/api-response.model';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Clients</h2>
        <p class="page-sub">Manage client accounts</p>
      </div>
      <a routerLink="/clients/new" class="btn btn-primary" *ngIf="auth.hasRole('Admin','Supervisor')">
        <i class="bi bi-plus-lg me-1"></i> New Client
      </a>
    </div>

    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-5">
            <input type="text" class="form-control form-control-sm" placeholder="Search by name, email or code..."
                   [(ngModel)]="req.q" (keyup.enter)="load()">
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="req.clientType">
              <option value="">All Types</option>
              <option>Standard</option><option>Premium</option><option>NonTraining</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary btn-sm" (click)="load()"><i class="bi bi-search me-1"></i>Filter</button>
            <button class="btn btn-outline-secondary btn-sm ms-1" (click)="clearFilters()">Clear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card cms-card">
      <div class="card-body p-0">
        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
        <div class="table-responsive" *ngIf="!loading()">
          <table class="table table-hover cms-table mb-0">
            <thead>
              <tr><th>Code</th><th>Company</th><th>Email</th><th>Type</th><th>Account Manager</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of result()?.items">
                <td><code class="text-primary">{{ c.clientCode }}</code></td>
                <td class="fw-medium">{{ c.companyName }}</td>
                <td class="text-muted">{{ c.primaryEmail }}</td>
                <td><span class="badge" [class]="getTypeClass(c.clientType)">{{ c.clientType }}</span></td>
                <td>{{ c.accountManagerName || '—' }}</td>
                <td>
                  <span class="badge" [class]="c.isActive ? 'bg-success' : 'bg-secondary'">
                    {{ c.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <a [routerLink]="['/clients', c.id]" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i>
                  </a>
                </td>
              </tr>
              <tr *ngIf="!result()?.items?.length">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="bi bi-building fs-3 d-block mb-2"></i>No clients found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top" *ngIf="result()">
          <small class="text-muted">{{ result()!.totalCount }} clients found</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="req.page === 1" (click)="changePage(-1)"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-outline-secondary" [disabled]="req.page! >= result()!.totalPages" (click)="changePage(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientsListComponent implements OnInit {
  private svc = inject(ClientService);
  auth = inject(AuthService);
  result = signal<PagedResult<Client> | null>(null);
  loading = signal(true);
  req: ClientSearchRequest = { page: 1, pageSize: 15 };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.search(this.req).subscribe({ next: res => { if (res.isSuccess) this.result.set(res.data); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  clearFilters(): void { this.req = { page: 1, pageSize: 15 }; this.load(); }
  changePage(delta: number): void { this.req.page = (this.req.page ?? 1) + delta; this.load(); }

  getTypeClass(t: string): string {
    return { Premium: 'bg-warning text-dark', Standard: 'bg-primary', NonTraining: 'bg-info text-dark' }[t] ?? 'bg-secondary';
  }
}
