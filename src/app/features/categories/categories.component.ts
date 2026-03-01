import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '@core/services/category.service';
import { AuthService } from '@core/services/auth.service';
import { Category, SlaPolicy } from '@core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">Categories & SLA</h2><p class="page-sub">Manage complaint categories and service level policies</p></div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><button class="nav-link" [class.active]="tab==='categories'" (click)="tab='categories'">Categories</button></li>
      <li class="nav-item"><button class="nav-link" [class.active]="tab==='sla'" (click)="tab='sla'">SLA Policies</button></li>
    </ul>

    <!-- Categories Tab -->
    <ng-container *ngIf="tab === 'categories'">
      <div class="row g-3">
        <div class="col-lg-7">
          <div class="card cms-card">
            <div class="card-header d-flex justify-content-between">
              <h6 class="card-title mb-0">All Categories</h6>
            </div>
            <div class="card-body p-0">
              <div *ngIf="loading()" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>
              <table class="table cms-table mb-0" *ngIf="!loading()">
                <thead><tr><th>Name</th><th>Parent</th><th>Status</th><th *ngIf="auth.hasRole('Admin')"></th></tr></thead>
                <tbody>
                  <tr *ngFor="let c of categories()">
                    <td class="fw-medium">{{ c.name }}</td>
                    <td class="text-muted small">{{ c.parentCategoryName || '—' }}</td>
                    <td><span class="badge" [class]="c.isActive ? 'bg-success' : 'bg-secondary'">{{ c.isActive ? 'Active' : 'Inactive' }}</span></td>
                    <td *ngIf="auth.hasRole('Admin')">
                      <button class="btn btn-sm btn-outline-danger" (click)="deactivate(c.id)"><i class="bi bi-x-circle"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-lg-5" *ngIf="auth.hasRole('Admin')">
          <div class="card cms-card">
            <div class="card-header"><h6 class="card-title mb-0">Add Category</h6></div>
            <div class="card-body">
              <form [formGroup]="catForm" (ngSubmit)="createCategory()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Category name">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Parent Category</label>
                  <select class="form-select" formControlName="parentCategoryId">
                    <option [value]="null">— Top Level —</option>
                    <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary btn-sm">Add Category</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- SLA Tab -->
    <ng-container *ngIf="tab === 'sla'">
      <div class="row g-3">
        <div class="col-lg-8">
          <div class="card cms-card">
            <div class="card-body p-0">
              <table class="table cms-table mb-0">
                <thead><tr><th>Category</th><th>Priority</th><th>Response (hrs)</th><th>Resolution (hrs)</th><th>Escalation %</th></tr></thead>
                <tbody>
                  <tr *ngFor="let s of slaPolicies()">
                    <td class="fw-medium">{{ s.categoryName }}</td>
                    <td><span class="badge" [class]="getPriorityClass(s.priority)">{{ s.priority }}</span></td>
                    <td>{{ s.responseTimeHours }}h</td>
                    <td>{{ s.resolutionTimeHours }}h</td>
                    <td>{{ s.escalationThresholdPct }}%</td>
                  </tr>
                  <tr *ngIf="!slaPolicies().length"><td colspan="5" class="text-center py-3 text-muted">No SLA policies configured</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-lg-4" *ngIf="auth.hasRole('Admin')">
          <div class="card cms-card">
            <div class="card-header"><h6 class="card-title mb-0">Add SLA Policy</h6></div>
            <div class="card-body">
              <form [formGroup]="slaForm" (ngSubmit)="createSla()">
                <div class="mb-2"><label class="form-label fw-medium">Category</label>
                  <select class="form-select form-select-sm" formControlName="categoryId">
                    <option value="">Select...</option>
                    <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div class="mb-2"><label class="form-label fw-medium">Priority</label>
                  <select class="form-select form-select-sm" formControlName="priority">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div class="mb-2"><label class="form-label fw-medium">Response (hours)</label>
                  <input type="number" class="form-control form-control-sm" formControlName="responseTimeHours">
                </div>
                <div class="mb-3"><label class="form-label fw-medium">Resolution (hours)</label>
                  <input type="number" class="form-control form-control-sm" formControlName="resolutionTimeHours">
                </div>
                <button type="submit" class="btn btn-primary btn-sm w-100">Save Policy</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `
})
export class CategoriesComponent implements OnInit {
  private svc = inject(CategoryService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  tab = 'categories';
  categories = signal<Category[]>([]);
  slaPolicies = signal<SlaPolicy[]>([]);
  loading = signal(true);

  catForm = this.fb.group({ name: ['', Validators.required], parentCategoryId: [null as number | null] });
  slaForm = this.fb.group({ categoryId: ['', Validators.required], priority: ['Medium', Validators.required], responseTimeHours: [24, Validators.required], resolutionTimeHours: [72, Validators.required] });

  ngOnInit(): void {
    this.svc.getAll().subscribe(r => { if (r.isSuccess) this.categories.set(r.data); this.loading.set(false); });
    this.svc.getAllSla().subscribe(r => { if (r.isSuccess) this.slaPolicies.set(r.data); });
  }

  createCategory(): void {
    if (this.catForm.invalid) return;
    this.svc.create(this.catForm.value as any).subscribe(r => { if (r.isSuccess) { this.categories.update(l => [...l, r.data]); this.catForm.reset(); } });
  }

  deactivate(id: number): void {
    if (!confirm('Deactivate this category?')) return;
    this.svc.deactivate(id).subscribe(() => this.categories.update(l => l.map(c => c.id === id ? { ...c, isActive: false } : c)));
  }

  createSla(): void {
    if (this.slaForm.invalid) return;
    this.svc.createSla(this.slaForm.value as any).subscribe(r => { if (r.isSuccess) { this.slaPolicies.update(l => [...l, r.data]); this.slaForm.reset({ priority: 'Medium', responseTimeHours: 24, resolutionTimeHours: 72 }); } });
  }

  getPriorityClass(p: string): string {
    return { Critical: 'bg-danger', High: 'bg-warning text-dark', Medium: 'bg-info text-dark', Low: 'bg-success' }[p] ?? 'bg-secondary';
  }
}
