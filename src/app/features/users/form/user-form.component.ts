import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { CreateUserRequest, UpdateUserRequest } from '@core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ isEditMode ? 'Edit User' : 'New User' }}</h2>
        <p class="page-sub">{{ isEditMode ? 'Update user account details' : 'Create a system user account' }}</p>
      </div>
    </div>
    <div class="card cms-card" style="max-width:650px">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-12"><label class="form-label fw-medium">Full Name <span class="text-danger">*</span></label><input type="text" class="form-control" formControlName="name"><div class="form-error" *ngIf="f['name'].touched && f['name'].invalid">Required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Email <span class="text-danger">*</span></label><input type="email" class="form-control" formControlName="email"><div class="form-error" *ngIf="f['email'].touched && f['email'].invalid">Valid email required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Username <span class="text-danger">*</span></label><input type="text" class="form-control" formControlName="username"><div class="form-error" *ngIf="f['username'].touched && f['username'].invalid">Required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Phone</label><input type="text" class="form-control" formControlName="phoneNumber"></div>
            <div class="col-md-6"><label class="form-label fw-medium">Role <span class="text-danger">*</span></label><select class="form-select" formControlName="role"><option>Admin</option><option>Supervisor</option><option>Agent</option><option>Client</option></select></div>
            <div class="col-12">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isActive" formControlName="isActive">
                <label class="form-check-label fw-medium" for="isActive">Is Active</label>
              </div>
            </div>
            <div class="col-12" *ngIf="!isEditMode"><label class="form-label fw-medium">Password <span class="text-danger">*</span></label><input type="password" class="form-control" formControlName="password"><div class="form-error" *ngIf="f['password'].touched && f['password'].invalid">Min 8 characters.</div></div>
            <div class="col-12">
              <div class="alert alert-danger py-2" *ngIf="errorMsg">{{ errorMsg }}</div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="loading"><span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>{{ isEditMode ? 'Update User' : 'Create User' }}</button>
                <button type="button" class="btn btn-outline-secondary" (click)="router.navigate(['/users'])">Cancel</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(UserService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  userId: number | null = null;
  isEditMode = false;
  loading = false;
  errorMsg = '';
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    phoneNumber: [''],
    role: ['Agent', Validators.required],
    isActive: [true],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.userId = Number(id);
    this.isEditMode = true;
    this.f.password.clearValidators();
    this.f.password.updateValueAndValidity();
    this.loadUser(this.userId);
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: res => {
        if (res.isSuccess) {
          const user = this.normalizeUser(res.data as unknown as Record<string, unknown>);
          this.form.patchValue({
            name: user.name,
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber ?? '',
            role: user.role || 'Agent',
            isActive: user.isActive
          });
          this.errorMsg = '';
        } else {
          this.errorMsg = res.message || 'Unable to load user.';
        }
        this.loading = false;
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Unable to load user.';
        this.loading = false;
      }
    });
  }

  private normalizeUser(data: Record<string, unknown>): {
    name: string;
    email: string;
    username: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
  } {
    const read = (pascal: string, camel: string): string => {
      const value = data[pascal] ?? data[camel];
      return typeof value === 'string' ? value : '';
    };
    const readBool = (pascal: string, camel: string): boolean => {
      const value = data[pascal] ?? data[camel];
      return typeof value === 'boolean' ? value : true;
    };

    return {
      name: read('Name', 'name'),
      email: read('Email', 'email'),
      username: read('Username', 'username'),
      phoneNumber: read('PhoneNumber', 'phoneNumber'),
      role: read('Role', 'role'),
      isActive: readBool('IsActive', 'isActive')
    };
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    if (this.isEditMode && this.userId != null) {
      const payload: UpdateUserRequest = {
        name: this.form.value.name ?? '',
        email: this.form.value.email ?? '',
        username: this.form.value.username ?? '',
        phoneNumber: this.form.value.phoneNumber ?? '',
        role: this.form.value.role ?? 'Agent',
        isActive: this.form.value.isActive ?? true
      };
      this.svc.update(this.userId, payload).subscribe({
        next: res => { if (res.isSuccess) this.router.navigate(['/users']); else { this.errorMsg = res.message; this.loading = false; } },
        error: err => { this.errorMsg = err.error?.message || 'Error.'; this.loading = false; }
      });
      return;
    }

    const payload: CreateUserRequest = {
      name: this.form.value.name ?? '',
      email: this.form.value.email ?? '',
      username: this.form.value.username ?? '',
      phoneNumber: this.form.value.phoneNumber ?? '',
      password: this.form.value.password ?? '',
      role: this.form.value.role ?? 'Agent',
      isActive: this.form.value.isActive ?? true
    };
    this.svc.create(payload).subscribe({
      next: res => { if (res.isSuccess) this.router.navigate(['/users']); else { this.errorMsg = res.message; this.loading = false; } },
      error: err => { this.errorMsg = err.error?.message || 'Error.'; this.loading = false; }
    });
  }
}
