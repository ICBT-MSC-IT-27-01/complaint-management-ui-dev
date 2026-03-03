import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ComplaintService } from '@core/services/complaint.service';
import { ClientService } from '@core/services/client.service';
import { CategoryService } from '@core/services/category.service';
import { AuthService } from '@core/services/auth.service';
import { Category } from '@core/models/category.model';
import { Client } from '@core/models/client.model';

interface CategoryOption {
  id: number;
  name: string;
  children: CategoryOption[];
}

@Component({
  selector: 'app-complaint-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">New Complaint</h2>
        <p class="page-sub">Log a new customer complaint</p>
      </div>
    </div>

    <div class="card cms-card" style="max-width: 800px">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-medium">Client</label>
              <select class="form-select" formControlName="clientId">
                <option [ngValue]="null">- Walk-in / Anonymous -</option>
                <option *ngFor="let c of clients()" [value]="clientIdOf(c)">{{ clientNameOf(c) }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Channel <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="complaintChannelId">
                <option [value]="1">Phone</option>
                <option [value]="2">Email</option>
                <option [value]="3">Portal</option>
                <option [value]="4">Walk-In</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-medium">Category <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="complaintCategoryId">
                <option value="">Select category...</option>
                <option *ngFor="let c of categoryOptions()" [value]="c.id">{{ c.name }}</option>
              </select>
              <div class="form-error" *ngIf="f['complaintCategoryId'].touched && f['complaintCategoryId'].invalid">Required.</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Subcategory</label>
              <select class="form-select" formControlName="subCategoryId" [disabled]="!subCategoryOptions().length">
                <option [ngValue]="null">Select subcategory...</option>
                <option *ngFor="let sc of subCategoryOptions()" [ngValue]="sc.id">{{ sc.name }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Priority <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="priority">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-medium">Subject <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="subject" placeholder="Brief description of the complaint">
              <div class="form-error" *ngIf="f['subject'].touched && f['subject'].invalid">Required.</div>
            </div>

            <div class="col-12">
              <label class="form-label fw-medium">Description <span class="text-danger">*</span></label>
              <textarea class="form-control" formControlName="description" rows="5" placeholder="Detailed description of the issue..."></textarea>
              <div class="form-error" *ngIf="f['description'].touched && f['description'].invalid">Required.</div>
            </div>

            <ng-container *ngIf="!form.value.clientId">
              <div class="col-md-6">
                <label class="form-label fw-medium">Client Name</label>
                <input type="text" class="form-control" formControlName="clientName" placeholder="Walk-in customer name">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-medium">Client Email</label>
                <input type="email" class="form-control" formControlName="clientEmail">
              </div>
            </ng-container>

            <div class="col-12">
              <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="loading()">
                  <span *ngIf="loading()" class="spinner-border spinner-border-sm me-1"></span>
                  Submit Complaint
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="onCancel()">Cancel</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ComplaintFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ComplaintService);
  private clientSvc = inject(ClientService);
  private catSvc = inject(CategoryService);
  private auth = inject(AuthService);
  router = inject(Router);

  clients = signal<Client[]>([]);
  categories = signal<Category[]>([]);
  categoryOptions = signal<CategoryOption[]>([]);
  subCategoryOptions = signal<CategoryOption[]>([]);
  loading = signal(false);
  errorMsg = '';

  form = this.fb.group({
    clientId: [null as number | null],
    clientName: [''],
    clientEmail: [''],
    clientMobile: [''],
    complaintChannelId: [1, Validators.required],
    complaintCategoryId: ['', Validators.required],
    subCategoryId: [null as number | null],
    subject: ['', [Validators.required, Validators.maxLength(300)]],
    description: ['', Validators.required],
    priority: ['Medium', Validators.required]
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.prefillRequesterFields();

    this.clientSvc.search({ pageSize: 100 }).subscribe((r) => {
      if (r.isSuccess) this.clients.set(r.data.items);
    });

    this.catSvc.getAll().subscribe((r) => {
      if (!r.isSuccess) return;
      this.categories.set(r.data);
      const options = (r.data ?? []).map((c) => this.mapCategory(c)).filter((c) => !!c.id);
      this.categoryOptions.set(options);
      this.updateSubCategories(this.form.value.complaintCategoryId);
    });

    this.f.complaintCategoryId.valueChanges.subscribe((value) => {
      this.form.patchValue({ subCategoryId: null }, { emitEvent: false });
      this.updateSubCategories(value);
    });

    this.f.clientId.valueChanges.subscribe((value) => {
      if (!value) this.prefillRequesterFields();
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg = '';
    const v = this.form.getRawValue();
    this.svc
      .create({
        ClientId: v.clientId ?? undefined,
        ClientName: v.clientName || undefined,
        ClientEmail: v.clientEmail || undefined,
        ClientMobile: v.clientMobile || undefined,
        ComplaintChannelId: Number(v.complaintChannelId),
        ComplaintCategoryId: Number(v.complaintCategoryId),
        SubCategoryId: v.subCategoryId ?? undefined,
        Subject: v.subject || '',
        Description: v.description || '',
        Priority: v.priority || 'Medium'
      })
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            if (this.auth.hasRole('Client')) {
              this.router.navigate(['/my-complaints']);
              return;
            }
            this.router.navigate(['/complaints', res.data.ComplaintNumber]);
          } else {
            this.errorMsg = res.message;
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Error submitting complaint.';
          this.loading.set(false);
        }
      });
  }

  onCancel(): void {
    if (this.auth.hasRole('Client')) {
      this.router.navigate(['/my-complaints']);
      return;
    }
    this.router.navigate(['/complaints']);
  }

  private prefillRequesterFields(): void {
    const me = this.auth.currentUser();
    if (!me) return;

    const currentName = (this.form.value.clientName ?? '').trim();
    const currentEmail = (this.form.value.clientEmail ?? '').trim();

    this.form.patchValue(
      {
        clientName: currentName || me.fullName || '',
        clientEmail: currentEmail || me.email || ''
      },
      { emitEvent: false }
    );
  }

  clientIdOf(c: Client): number {
    const item = c as Client & { Id?: number; id?: number };
    return item.id ?? item.Id ?? 0;
  }

  clientNameOf(c: Client): string {
    const item = c as Client & { CompanyName?: string; companyName?: string };
    return item.companyName ?? item.CompanyName ?? '-';
  }

  private mapCategory(c: Category): CategoryOption {
    const item = c as Category & {
      Id?: number;
      Name?: string;
      Children?: Category[];
      id?: number;
      name?: string;
      children?: Category[];
    };

    const children = (item.children ?? item.Children ?? []).map((x) => this.mapCategory(x));
    return {
      id: item.id ?? item.Id ?? 0,
      name: item.name ?? item.Name ?? '',
      children
    };
  }

  private updateSubCategories(categoryIdValue: unknown): void {
    const categoryId = Number(categoryIdValue);
    if (!categoryId) {
      this.subCategoryOptions.set([]);
      return;
    }
    const selected = this.categoryOptions().find((c) => c.id === categoryId);
    this.subCategoryOptions.set(selected?.children ?? []);
  }
}
