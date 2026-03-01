import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateComplaintRequest } from '@core/models/complaint.model';
import { ComplaintService } from '@core/services/complaint.service';

@Component({
  selector: 'app-complaint-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complaint-new.component.html',
  styleUrl: './complaint-new.component.scss'
})
export class ComplaintNewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly complaintService = inject(ComplaintService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    clientId: [null as number | null],
    clientName: [''],
    clientEmail: [''],
    clientMobile: [''],
    complaintChannelId: [2, Validators.required],
    complaintCategoryId: [1, Validators.required],
    subCategoryId: [null as number | null],
    subject: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['Medium', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: CreateComplaintRequest = {
      clientId: formValue.clientId ?? undefined,
      clientName: formValue.clientName ?? undefined,
      clientEmail: formValue.clientEmail ?? undefined,
      clientMobile: formValue.clientMobile ?? undefined,
      complaintChannelId: Number(formValue.complaintChannelId ?? 2),
      complaintCategoryId: Number(formValue.complaintCategoryId ?? 1),
      subCategoryId: formValue.subCategoryId ?? undefined,
      subject: formValue.subject ?? '',
      description: formValue.description ?? '',
      priority: (formValue.priority ?? 'Medium') as CreateComplaintRequest['priority']
    };

    this.complaintService.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/complaints'),
      error: () => this.router.navigateByUrl('/complaints')
    });
  }
}

