import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '@core/services/department.service';
import { AuthService } from '@core/services/auth.service';
import {
  Department,
  DepartmentSearchRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '@core/models/department.model';
import { PagedResult } from '@core/models/api-response.model';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Departments</h2>
        <p class="page-sub">Manage departments used for user and complaint organization.</p>
      </div>
      <button class="btn btn-primary" *ngIf="auth.hasRole('Admin','Supervisor')" (click)="startCreate()">
        <i class="bi bi-plus-circle me-1"></i> Add Department
      </button>
    </div>

    <div class="card cms-card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-5">
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Search by department name..."
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

    <div class="card cms-card mb-3" *ngIf="showForm() && auth.hasRole('Admin','Supervisor')">
      <div class="card-header">
        <h6 class="card-title mb-0">{{ editingId() ? 'Edit Department' : 'Add Department' }}</h6>
      </div>
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="save()" class="row g-3">
          <div class="col-md-5">
            <label class="form-label fw-medium">Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" formControlName="name" />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-medium">Sort Order</label>
            <input type="number" class="form-control" formControlName="sortOrder" />
          </div>
          <div class="col-md-4">
            <label class="form-label fw-medium">Status</label>
            <select class="form-select" formControlName="isActive" [disabled]="!editingId()">
              <option [ngValue]="true">Active</option>
              <option [ngValue]="false">Inactive</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label fw-medium">Description</label>
            <textarea rows="2" class="form-control" formControlName="description"></textarea>
          </div>
          <div class="col-12 d-flex gap-2">
            <button class="btn btn-primary btn-sm" type="submit" [disabled]="form.invalid || submitting()">
              {{ editingId() ? 'Update' : 'Create' }}
            </button>
            <button class="btn btn-outline-secondary btn-sm" type="button" (click)="cancelEdit()">Cancel</button>
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
              <tr><th>Code</th><th>Name</th><th>Description</th><th>Order</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of result()?.items">
                <td><code class="text-primary">{{ departmentCode(d) }}</code></td>
                <td class="fw-medium">{{ departmentName(d) }}</td>
                <td class="text-muted">{{ departmentDescription(d) || '—' }}</td>
                <td>{{ departmentSortOrder(d) }}</td>
                <td>
                  <span class="badge" [class]="isActive(d) ? 'bg-success' : 'bg-secondary'">
                    {{ isActive(d) ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" *ngIf="auth.hasRole('Admin','Supervisor')" (click)="edit(d)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" *ngIf="auth.hasRole('Admin')" (click)="remove(d)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!result()?.items?.length">
                <td colspan="6" class="text-center py-4 text-muted">
                  <i class="bi bi-diagram-2 fs-3 d-block mb-2"></i>No departments found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-top" *ngIf="result()">
          <small class="text-muted">{{ result()!.totalCount }} departments found</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="req.page === 1" (click)="changePage(-1)"><i class="bi bi-chevron-left"></i></button>
            <button class="btn btn-outline-secondary" [disabled]="req.page! >= result()!.totalPages" (click)="changePage(1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DepartmentsComponent implements OnInit {
  private svc = inject(DepartmentService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  result = signal<PagedResult<Department> | null>(null);
  loading = signal(true);
  submitting = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  activeFilter = '';
  req: DepartmentSearchRequest = { page: 1, pageSize: 15 };

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    sortOrder: [0, Validators.required],
    isActive: [true, Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  applyFilters(): void {
    this.req.page = 1;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const request: DepartmentSearchRequest = {
      ...this.req,
      q: String(this.req.q ?? '').trim(),
      isActive: this.activeFilter === '' ? null : this.activeFilter === 'true'
    };

    this.svc.search(request).subscribe({
      next: (res) => {
        if (res.isSuccess) this.result.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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

  startCreate(): void {
    this.showForm.set(true);
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', sortOrder: 0, isActive: true });
  }

  edit(department: Department): void {
    const id = this.departmentId(department);
    if (!id) return;

    this.showForm.set(true);
    this.editingId.set(id);
    this.submitting.set(true);

    this.svc.getById(id).subscribe({
      next: (res) => {
        this.submitting.set(false);
        const current = res.isSuccess ? res.data : department;
        this.form.reset({
          name: this.departmentName(current),
          description: this.departmentDescription(current),
          sortOrder: this.departmentSortOrder(current),
          isActive: this.isActive(current)
        });
      },
      error: () => {
        this.submitting.set(false);
        this.form.reset({
          name: this.departmentName(department),
          description: this.departmentDescription(department),
          sortOrder: this.departmentSortOrder(department),
          isActive: this.isActive(department)
        });
      }
    });
  }

  cancelEdit(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const id = this.editingId();
    this.submitting.set(true);

    if (!id) {
      const payload: CreateDepartmentRequest = {
        name: values.name ?? '',
        description: values.description ?? '',
        sortOrder: values.sortOrder ?? 0
      };
      this.svc.create(payload).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (!res.isSuccess) return;
          this.cancelEdit();
          this.load();
        },
        error: () => this.submitting.set(false)
      });
      return;
    }

    const payload: UpdateDepartmentRequest = {
      name: values.name ?? '',
      description: values.description ?? '',
      sortOrder: values.sortOrder ?? 0,
      isActive: values.isActive ?? true
    };

    this.svc.update(id, payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (!res.isSuccess) return;
        this.cancelEdit();
        this.load();
      },
      error: () => this.submitting.set(false)
    });
  }

  remove(department: Department): void {
    const id = this.departmentId(department);
    if (!id) return;
    if (!confirm(`Delete department "${this.departmentName(department)}"?`)) return;
    this.svc.delete(id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.load();
      }
    });
  }

  departmentId(department: Department): number {
    const item = department as Department & { id?: number };
    return department.Id ?? item.id ?? 0;
  }

  departmentCode(department: Department): string {
    const item = department as Department & { departmentCode?: string };
    return department.DepartmentCode ?? item.departmentCode ?? '-';
  }

  departmentName(department: Department): string {
    const item = department as Department & { name?: string };
    return department.Name ?? item.name ?? '-';
  }

  departmentDescription(department: Department): string {
    const item = department as Department & { description?: string };
    return department.Description ?? item.description ?? '';
  }

  departmentSortOrder(department: Department): number {
    const item = department as Department & { sortOrder?: number };
    return department.SortOrder ?? item.sortOrder ?? 0;
  }

  isActive(department: Department): boolean {
    const item = department as Department & { isActive?: boolean };
    return department.IsActive ?? item.isActive ?? false;
  }
}
