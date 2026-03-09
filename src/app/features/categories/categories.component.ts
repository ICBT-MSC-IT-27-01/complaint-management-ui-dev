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
                <thead><tr><th>Name</th><th>Parent</th><th>Status</th><th *ngIf="auth.hasRole('Admin')">Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let c of pagedCategories()">
                    <td class="fw-medium">{{ c.name }}</td>
                    <td class="text-muted small">{{ c.parentName || c.parentCategoryName || '—' }}</td>
                    <td><span class="badge" [class]="c.isActive ? 'bg-success' : 'bg-secondary'">{{ c.isActive ? 'Active' : 'Inactive' }}</span></td>
                    <td *ngIf="auth.hasRole('Admin')">
                      <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary" [disabled]="!c.parentCategoryId" (click)="startCategoryEdit(c)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" (click)="deactivate(c.id)">
                          <i class="bi bi-x-circle"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!pagedCategories().length"><td colspan="4" class="text-center py-3 text-muted">No categories found</td></tr>
                </tbody>
              </table>
              <div class="d-flex justify-content-between align-items-center p-3 border-top" *ngIf="!loading()">
                <small class="text-muted">Page {{ categoryPage() }} of {{ categoryTotalPages() }}</small>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary" [disabled]="categoryPage() <= 1" (click)="setCategoryPage(categoryPage() - 1)">Previous</button>
                  <button class="btn btn-sm btn-outline-secondary" [disabled]="categoryPage() >= categoryTotalPages()" (click)="setCategoryPage(categoryPage() + 1)">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-5" *ngIf="auth.hasRole('Admin')">
          <div class="card cms-card">
            <div class="card-header"><h6 class="card-title mb-0">Add Parent Category</h6></div>
            <div class="card-body">
              <form [formGroup]="parentForm" (ngSubmit)="createParentCategory()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Category name">
                </div>
                <button type="submit" class="btn btn-primary btn-sm">Add Parent Category</button>
              </form>
            </div>
          </div>

          <div class="card cms-card mt-3">
            <div class="card-header"><h6 class="card-title mb-0">Add Category</h6></div>
            <div class="card-body">
              <form [formGroup]="catForm" (ngSubmit)="createCategory()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Sub category name">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Parent Category <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="parentCategoryId">
                    <option [ngValue]="null">Select parent category...</option>
                    <option *ngFor="let c of parentCategories()" [ngValue]="c.id">{{ c.name }}</option>
                  </select>
                  <small class="text-danger" *ngIf="showParentCategoryError()">Parent category is required.</small>
                </div>
                <button type="submit" class="btn btn-primary btn-sm" [disabled]="catForm.invalid">Add Category</button>
              </form>
            </div>
          </div>

          <div class="card cms-card mt-3" *ngIf="editingCategoryId() !== null">
            <div class="card-header"><h6 class="card-title mb-0">Edit Category</h6></div>
            <div class="card-body">
              <form [formGroup]="catEditForm" (ngSubmit)="updateCategory()">
                <div class="mb-3">
                  <label class="form-label fw-medium">Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Sub category name">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Parent Category <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="parentCategoryId">
                    <option [ngValue]="null">Select parent category...</option>
                    <option *ngFor="let c of parentCategories()" [ngValue]="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary btn-sm" [disabled]="catEditForm.invalid">Update Category</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm" (click)="cancelCategoryEdit()">Cancel</button>
                </div>
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
                <thead><tr><th>Category</th><th>Priority</th><th>Response (hrs)</th><th>Resolution (hrs)</th><th>Escalation %</th><th *ngIf="auth.hasRole('Admin')">Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let s of pagedSlaPolicies()">
                    <td class="fw-medium">{{ s.categoryName }}</td>
                    <td><span class="badge" [class]="getPriorityClass(s.priority)">{{ s.priority }}</span></td>
                    <td>{{ s.responseTimeHours }}h</td>
                    <td>{{ s.resolutionTimeHours }}h</td>
                    <td>{{ s.escalationThresholdPct }}%</td>
                    <td *ngIf="auth.hasRole('Admin')">
                      <button class="btn btn-sm btn-outline-primary" (click)="startSlaEdit(s)">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!pagedSlaPolicies().length"><td [attr.colspan]="auth.hasRole('Admin') ? 6 : 5" class="text-center py-3 text-muted">No SLA policies configured</td></tr>
                </tbody>
              </table>
              <div class="d-flex justify-content-between align-items-center p-3 border-top">
                <small class="text-muted">Page {{ slaPage() }} of {{ slaTotalPages() }}</small>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary" [disabled]="slaPage() <= 1" (click)="setSlaPage(slaPage() - 1)">Previous</button>
                  <button class="btn btn-sm btn-outline-secondary" [disabled]="slaPage() >= slaTotalPages()" (click)="setSlaPage(slaPage() + 1)">Next</button>
                </div>
              </div>
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
                    <option *ngFor="let c of slaCategoryOptions()" [value]="c.id">{{ c.name }}</option>
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
                <div class="text-danger small mb-2" *ngIf="slaError()">{{ slaError() }}</div>
                <button type="submit" class="btn btn-primary btn-sm w-100">Save Policy</button>
              </form>
            </div>
          </div>

          <div class="card cms-card mt-3" *ngIf="editingSlaId() !== null">
            <div class="card-header"><h6 class="card-title mb-0">Edit SLA Policy</h6></div>
            <div class="card-body">
              <form [formGroup]="slaEditForm" (ngSubmit)="updateSla()">
                <div class="mb-2"><label class="form-label fw-medium">Category</label>
                  <select class="form-select form-select-sm" formControlName="categoryId">
                    <option value="">Select...</option>
                    <option *ngFor="let c of slaCategoryOptions()" [value]="c.id">{{ c.name }}</option>
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
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary btn-sm">Update SLA</button>
                  <button type="button" class="btn btn-outline-secondary btn-sm" (click)="cancelSlaEdit()">Cancel</button>
                </div>
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
  flatCategories = signal<Category[]>([]);
  parentCategories = signal<Category[]>([]);
  slaPolicies = signal<SlaPolicy[]>([]);
  loading = signal(true);
  categorySubmitAttempted = signal(false);
  categoryPage = signal(1);
  categoryPageSize = 8;
  slaPage = signal(1);
  slaPageSize = 8;
  editingCategoryId = signal<number | null>(null);
  editingSlaId = signal<number | null>(null);
  slaError = signal('');

  parentForm = this.fb.group({ name: ['', Validators.required] });
  catForm = this.fb.group({ name: ['', Validators.required], parentCategoryId: [null as number | null, Validators.required] });
  catEditForm = this.fb.group({ name: ['', Validators.required], parentCategoryId: [null as number | null, Validators.required] });
  slaForm = this.fb.group({ categoryId: ['', Validators.required], priority: ['Medium', Validators.required], responseTimeHours: [24, Validators.required], resolutionTimeHours: [72, Validators.required] });
  slaEditForm = this.fb.group({ categoryId: ['', Validators.required], priority: ['Medium', Validators.required], responseTimeHours: [24, Validators.required], resolutionTimeHours: [72, Validators.required] });

  ngOnInit(): void {
    this.loadCategories();
    this.loadParentCategories();
    this.loadSlaPolicies();
  }

  createParentCategory(): void {
    if (this.parentForm.invalid) return;

    const name = (this.parentForm.controls.name.value ?? '').trim();
    if (!name) {
      this.parentForm.controls.name.setErrors({ required: true });
      return;
    }

    this.svc.createParent({ name }).subscribe(r => {
      if (!r.isSuccess) return;
      this.parentForm.reset();
      this.loadCategories();
      this.loadParentCategories();
    });
  }

  createCategory(): void {
    this.categorySubmitAttempted.set(true);
    if (this.catForm.invalid) return;

    const v = this.catForm.getRawValue();
    const parentCategoryId = v.parentCategoryId;
    if (typeof parentCategoryId !== 'number' || parentCategoryId <= 0) {
      this.catForm.controls.parentCategoryId.setErrors({ required: true });
      return;
    }

    this.svc.create({ name: (v.name ?? '').trim(), parentCategoryId }).subscribe(r => {
      if (!r.isSuccess) return;
      this.catForm.reset({ parentCategoryId: null });
      this.categorySubmitAttempted.set(false);
      this.loadCategories();
    });
  }

  startCategoryEdit(category: Category): void {
    if (!category.parentCategoryId) return;
    this.editingCategoryId.set(category.id);
    this.catEditForm.setValue({ name: category.name, parentCategoryId: category.parentCategoryId });
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId.set(null);
    this.catEditForm.reset({ parentCategoryId: null });
  }

  updateCategory(): void {
    const categoryId = this.editingCategoryId();
    if (!categoryId || this.catEditForm.invalid) return;

    const v = this.catEditForm.getRawValue();
    const parentCategoryId = v.parentCategoryId;
    if (typeof parentCategoryId !== 'number' || parentCategoryId <= 0) {
      this.catEditForm.controls.parentCategoryId.setErrors({ required: true });
      return;
    }

    this.svc.update(categoryId, { name: (v.name ?? '').trim(), parentCategoryId }).subscribe(r => {
      if (!r.isSuccess) return;
      this.cancelCategoryEdit();
      this.loadCategories();
      this.loadParentCategories();
    });
  }

  deactivate(id: number): void {
    if (!confirm('Deactivate this category?')) return;
    this.svc.deactivate(id).subscribe(() => this.loadCategories());
  }

  createSla(): void {
    if (this.slaForm.invalid) return;
    const v = this.slaForm.getRawValue();
    const categoryId = Number(v.categoryId);
    const responseTimeHours = Number(v.responseTimeHours);
    const resolutionTimeHours = Number(v.resolutionTimeHours);
    if (!Number.isFinite(categoryId) || categoryId <= 0 || !this.slaCategoryOptions().some(c => c.id === categoryId)) {
      this.slaError.set('Select a valid sub category.');
      return;
    }
    if (!Number.isFinite(responseTimeHours) || responseTimeHours <= 0 || !Number.isFinite(resolutionTimeHours) || resolutionTimeHours <= 0) {
      this.slaError.set('Response and resolution hours must be greater than 0.');
      return;
    }
    this.slaError.set('');

    this.svc.createSla({
      categoryId,
      priority: v.priority ?? 'Medium',
      responseTimeHours,
      resolutionTimeHours,
      escalationThresholdPct: 80
    }).subscribe(r => {
      if (!r.isSuccess) return;
      this.slaForm.reset({ priority: 'Medium', responseTimeHours: 24, resolutionTimeHours: 72 });
      this.loadSlaPolicies();
    }, (err) => {
      const message = err?.error?.message ?? err?.message ?? 'Failed to create SLA policy.';
      this.slaError.set(message);
    });
  }

  startSlaEdit(policy: SlaPolicy): void {
    this.slaError.set('');
    this.editingSlaId.set(policy.id);
    this.slaEditForm.setValue({
      categoryId: String(policy.categoryId),
      priority: policy.priority,
      responseTimeHours: policy.responseTimeHours,
      resolutionTimeHours: policy.resolutionTimeHours
    });
  }

  cancelSlaEdit(): void {
    this.slaError.set('');
    this.editingSlaId.set(null);
    this.slaEditForm.reset({ priority: 'Medium', responseTimeHours: 24, resolutionTimeHours: 72 });
  }

  updateSla(): void {
    const slaId = this.editingSlaId();
    if (!slaId || this.slaEditForm.invalid) return;

    const v = this.slaEditForm.getRawValue();
    const categoryId = Number(v.categoryId);
    const responseTimeHours = Number(v.responseTimeHours);
    const resolutionTimeHours = Number(v.resolutionTimeHours);
    if (!Number.isFinite(categoryId) || categoryId <= 0 || !this.slaCategoryOptions().some(c => c.id === categoryId)) {
      this.slaError.set('Select a valid sub category.');
      return;
    }
    if (!Number.isFinite(responseTimeHours) || responseTimeHours <= 0 || !Number.isFinite(resolutionTimeHours) || resolutionTimeHours <= 0) {
      this.slaError.set('Response and resolution hours must be greater than 0.');
      return;
    }
    this.slaError.set('');

    this.svc.updateSla(slaId, {
      categoryId,
      priority: v.priority ?? 'Medium',
      responseTimeHours,
      resolutionTimeHours,
      escalationThresholdPct: 80
    }).subscribe(r => {
      if (!r.isSuccess) return;
      this.cancelSlaEdit();
      this.loadSlaPolicies();
    }, (err) => {
      const message = err?.error?.message ?? err?.message ?? 'Failed to update SLA policy.';
      this.slaError.set(message);
    });
  }

  getPriorityClass(p: string): string {
    return { Critical: 'bg-danger', High: 'bg-warning text-dark', Medium: 'bg-info text-dark', Low: 'bg-success' }[p] ?? 'bg-secondary';
  }

  private loadCategories(): void {
    this.svc.getAll().subscribe(r => {
      if (r.isSuccess) {
        const tree = (r.data ?? []).map(c => this.normalizeCategory(c));
        this.categories.set(tree);
        this.flatCategories.set(this.flatten(tree));
        this.categoryPage.set(1);
      }
      this.loading.set(false);
    });
  }

  private loadParentCategories(): void {
    this.svc.getParents().subscribe(r => {
      if (!r.isSuccess) return;
      this.parentCategories.set((r.data ?? []).map(c => this.normalizeCategory(c)));
    });
  }

  private loadSlaPolicies(): void {
    this.svc.getAllSla().subscribe(r => {
      if (!r.isSuccess) return;
      this.slaPolicies.set(r.data ?? []);
      this.slaPage.set(1);
    });
  }

  private normalizeCategory(c: Category): Category {
    const item = c as Category & {
      id?: number;
      Id?: number;
      name?: string;
      Name?: string;
      parentCategoryId?: number;
      ParentCategoryId?: number;
      parentName?: string;
      ParentName?: string;
      parentCategoryName?: string;
      ParentCategoryName?: string;
      sortOrder?: number;
      SortOrder?: number;
      isActive?: boolean;
      IsActive?: boolean;
      children?: Category[];
      Children?: Category[];
    };

    return {
      id: item.id ?? item.Id ?? 0,
      name: item.name ?? item.Name ?? '',
      parentCategoryId: item.parentCategoryId ?? item.ParentCategoryId,
      parentName: item.parentName ?? item.ParentName ?? item.parentCategoryName ?? item.ParentCategoryName,
      parentCategoryName: item.parentCategoryName ?? item.ParentCategoryName,
      sortOrder: item.sortOrder ?? item.SortOrder ?? 0,
      isActive: item.isActive ?? item.IsActive ?? true,
      children: (item.children ?? item.Children ?? []).map(x => this.normalizeCategory(x))
    };
  }

  private flatten(input: Category[]): Category[] {
    const output: Category[] = [];

    const walk = (categories: Category[], parentName?: string): void => {
      for (const category of categories) {
        output.push({
          ...category,
          parentName: category.parentName ?? parentName
        });

        if (category.children?.length) {
          walk(category.children, category.name);
        }
      }
    };

    walk(input);
    return output;
  }

  showParentCategoryError(): boolean {
    const ctrl = this.catForm.controls.parentCategoryId;
    return !!ctrl.errors && (ctrl.touched || ctrl.dirty || this.categorySubmitAttempted());
  }

  slaCategoryOptions(): Category[] {
    return this.flatCategories().filter(c => !!c.parentCategoryId && c.isActive);
  }

  pagedCategories(): Category[] {
    const start = (this.categoryPage() - 1) * this.categoryPageSize;
    return this.flatCategories().slice(start, start + this.categoryPageSize);
  }

  categoryTotalPages(): number {
    return Math.max(1, Math.ceil(this.flatCategories().length / this.categoryPageSize));
  }

  setCategoryPage(page: number): void {
    this.categoryPage.set(Math.min(Math.max(page, 1), this.categoryTotalPages()));
  }

  pagedSlaPolicies(): SlaPolicy[] {
    const start = (this.slaPage() - 1) * this.slaPageSize;
    return this.slaPolicies().slice(start, start + this.slaPageSize);
  }

  slaTotalPages(): number {
    return Math.max(1, Math.ceil(this.slaPolicies().length / this.slaPageSize));
  }

  setSlaPage(page: number): void {
    this.slaPage.set(Math.min(Math.max(page, 1), this.slaTotalPages()));
  }
}
