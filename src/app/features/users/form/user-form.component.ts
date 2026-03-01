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
            <div class="col-12"><label class="form-label fw-medium">Full Name <span class="text-danger">*</span></label><input type="text" class="form-control" formControlName="Name"><div class="form-error" *ngIf="f['Name'].touched && f['Name'].invalid">Required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Email <span class="text-danger">*</span></label><input type="email" class="form-control" formControlName="Email"><div class="form-error" *ngIf="f['Email'].touched && f['Email'].invalid">Valid email required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Username <span class="text-danger">*</span></label><input type="text" class="form-control" formControlName="Username"><div class="form-error" *ngIf="f['Username'].touched && f['Username'].invalid">Required.</div></div>
            <div class="col-md-6"><label class="form-label fw-medium">Phone</label><input type="text" class="form-control" formControlName="PhoneNumber"></div>
            <div class="col-md-6"><label class="form-label fw-medium">Role <span class="text-danger">*</span></label><select class="form-select" formControlName="Role"><option>Admin</option><option>Supervisor</option><option>Agent</option><option>Client</option></select></div>
            <div class="col-12" *ngIf="isEditMode">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isActive" formControlName="IsActive">
                <label class="form-check-label fw-medium" for="isActive">Is Active</label>
              </div>
            </div>
            <div class="col-12" *ngIf="!isEditMode"><label class="form-label fw-medium">Password <span class="text-danger">*</span></label><input type="password" class="form-control" formControlName="Password"><div class="form-error" *ngIf="f['Password'].touched && f['Password'].invalid">Min 8 characters.</div></div>
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
    Name: ['', Validators.required],
    Email: ['', [Validators.required, Validators.email]],
    Username: ['', Validators.required],
    PhoneNumber: [''],
    Role: ['Agent', Validators.required],
    IsActive: [true],
    Password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.userId = Number(id);
    this.isEditMode = true;
    this.f.Password.clearValidators();
    this.f.Password.updateValueAndValidity();
    this.loadUser(this.userId);
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: res => {
        if (res.isSuccess) {
          const user = this.normalizeUser(res.data as unknown as Record<string, unknown>);
          this.form.patchValue({
            Name: user.Name,
            Email: user.Email,
            Username: user.Username,
            PhoneNumber: user.PhoneNumber ?? '',
            Role: user.Role || 'Agent',
            IsActive: user.IsActive
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
    Name: string;
    Email: string;
    Username: string;
    PhoneNumber: string;
    Role: string;
    IsActive: boolean;
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
      Name: read('Name', 'name'),
      Email: read('Email', 'email'),
      Username: read('Username', 'username'),
      PhoneNumber: read('PhoneNumber', 'phoneNumber'),
      Role: read('Role', 'role'),
      IsActive: readBool('IsActive', 'isActive')
    };
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    if (this.isEditMode && this.userId != null) {
      const payload: UpdateUserRequest = {
        Name: this.form.value.Name ?? '',
        Email: this.form.value.Email ?? '',
        Username: this.form.value.Username ?? '',
        PhoneNumber: this.form.value.PhoneNumber ?? '',
        Role: this.form.value.Role ?? 'Agent',
        IsActive: this.form.value.IsActive ?? true
      };
      this.svc.update(this.userId, payload).subscribe({
        next: res => { if (res.isSuccess) this.router.navigate(['/users']); else { this.errorMsg = res.message; this.loading = false; } },
        error: err => { this.errorMsg = err.error?.message || 'Error.'; this.loading = false; }
      });
      return;
    }

    const payload: CreateUserRequest = {
      Name: this.form.value.Name ?? '',
      Email: this.form.value.Email ?? '',
      Username: this.form.value.Username ?? '',
      PhoneNumber: this.form.value.PhoneNumber ?? '',
      Password: this.form.value.Password ?? '',
      Role: this.form.value.Role ?? 'Agent'
    };
    this.svc.create(payload).subscribe({
      next: res => { if (res.isSuccess) this.router.navigate(['/users']); else { this.errorMsg = res.message; this.loading = false; } },
      error: err => { this.errorMsg = err.error?.message || 'Error.'; this.loading = false; }
    });
  }
}
