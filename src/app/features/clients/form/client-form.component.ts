import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ClientService } from '@core/services/client.service';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  template: `
    <div class="page-header">
      <div><h2 class="page-title">New Client</h2><p class="page-sub">Register a new client account</p></div>
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
              <input type="text" class="form-control" formControlName="primaryPhone">
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
                  <span *ngIf="loading()" class="spinner-border spinner-border-sm me-1"></span>Create Client
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
  router = inject(Router);

  agents = signal<User[]>([]);
  loading = signal(false);
  errorMsg = '';

  form = this.fb.group({
    companyName: ['', Validators.required],
    primaryEmail: ['', [Validators.required, Validators.email]],
    primaryPhone: [''],
    address: [''],
    clientType: ['Standard', Validators.required],
    accountManagerId: [null as number | null]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.userSvc.getAgents().subscribe(r => { if (r.isSuccess) this.agents.set(r.data); });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.svc.create(this.form.value as any).subscribe({
      next: res => { if (res.isSuccess) this.router.navigate(['/clients']); else { this.errorMsg = res.message; this.loading.set(false); } },
      error: err => { this.errorMsg = err.error?.message || 'Error.'; this.loading.set(false); }
    });
  }
}
