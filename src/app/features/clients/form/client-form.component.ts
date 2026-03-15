import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ClientService } from '@core/services/client.service';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { CreateClientRequest } from '@core/models/client.model';
import { contactNumberValidator, showValidationAlert, textFieldValidator, trimFormValues } from '@core/utils/form-validation.util';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ isEditMode ? 'Edit Client' : 'New Client' }}</h2>
        <p class="page-sub">{{ isEditMode ? 'Update client account details' : 'Register a new client account' }}</p>
      </div>
    </div>
    <div class="card cms-card" style="max-width: 700px">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-medium">Company Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control" formControlName="companyName">
              <div class="form-error" *ngIf="f['companyName'].touched && f['companyName'].invalid">Required.</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Email <span class="text-danger">*</span></label>
              <input type="email" class="form-control" formControlName="primaryEmail">
              <div class="form-error" *ngIf="f['primaryEmail'].touched && f['primaryEmail'].invalid">Valid email required.</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Phone</label>
              <input type="text" inputmode="numeric" class="form-control" formControlName="primaryPhone">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Client Type <span class="text-danger">*</span></label>
              <select class="form-select" formControlName="clientType">
                <option>Standard</option><option>Premium</option><option>NonTraining</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Account Manager</label>
              <select class="form-select" formControlName="accountManagerId">
                <option [value]="null">-</option>
                <option *ngFor="let u of agents()" [value]="u.Id">{{ u.Name }}</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-medium">Address</label>
              <textarea class="form-control" formControlName="address" rows="2"></textarea>
            </div>
            <div class="col-12">
              <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="loading()">
                  <span *ngIf="loading()" class="spinner-border spinner-border-sm me-1"></span>{{ isEditMode ? 'Update Client' : 'Create Client' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/clients'])">Cancel</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ClientService);
  private userSvc = inject(UserService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  agents = signal<User[]>([]);
  loading = signal(false);
  isEditMode = false;
  clientId: number | null = null;
  errorMsg = '';

  form = this.fb.group({
    companyName: ['', [Validators.required, textFieldValidator(true)]],
    primaryEmail: ['', [Validators.required, Validators.email]],
    primaryPhone: ['', contactNumberValidator()],
    address: ['', textFieldValidator()],
    clientType: ['Standard', Validators.required],
    accountManagerId: [null as number | null]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.userSvc.getAgents().subscribe(r => { if (r.isSuccess) this.agents.set(r.data); });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.clientId = Number(id);
    this.isEditMode = true;
    this.loadClient(this.clientId);
  }

  private loadClient(id: number): void {
    this.loading.set(true);
    this.svc.getById(id).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.form.patchValue({
            companyName: res.data.companyName ?? '',
            primaryEmail: res.data.primaryEmail ?? '',
            primaryPhone: res.data.primaryPhone ?? '',
            address: res.data.address ?? '',
            clientType: res.data.clientType ?? 'Standard',
            accountManagerId: res.data.accountManagerId ?? null
          });
          this.errorMsg = '';
        } else {
          this.errorMsg = res.message || 'Unable to load client.';
        }
        this.loading.set(false);
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Unable to load client.';
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    trimFormValues(this.form, ['companyName', 'primaryEmail', 'primaryPhone', 'address']);
    if (this.form.invalid) {
      showValidationAlert(this.form, {
        companyName: { label: 'Company Name', type: 'text' },
        primaryEmail: { label: 'Email', type: 'email' },
        primaryPhone: { label: 'Phone', type: 'contact' },
        address: { label: 'Address', type: 'text' }
      });
      return;
    }
    this.loading.set(true);

    const payload: CreateClientRequest = {
      companyName: this.form.value.companyName ?? '',
      primaryEmail: this.form.value.primaryEmail ?? '',
      primaryPhone: this.form.value.primaryPhone || undefined,
      address: this.form.value.address || undefined,
      clientType: this.form.value.clientType ?? 'Standard',
      accountManagerId: this.form.value.accountManagerId ?? undefined
    };

    const request$ = this.isEditMode && this.clientId != null
      ? this.svc.update(this.clientId, payload)
      : this.svc.create(payload);

    request$.subscribe({
      next: res => { if (res.isSuccess) this.router.navigate(['/clients']); else { this.errorMsg = res.message; this.loading.set(false); } },
      error: err => { this.errorMsg = err.error?.message || 'Error.'; this.loading.set(false); }
    });
  }
}
