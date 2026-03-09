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
      ClientId: formValue.clientId ?? undefined,
      ClientName: formValue.clientName ?? undefined,
      ClientEmail: formValue.clientEmail ?? undefined,
      ClientMobile: formValue.clientMobile ?? undefined,
      ComplaintChannelId: Number(formValue.complaintChannelId ?? 2),
      ComplaintCategoryId: Number(formValue.complaintCategoryId ?? 1),
      SubCategoryId: formValue.subCategoryId ?? undefined,
      Subject: formValue.subject ?? '',
      Description: formValue.description ?? '',
      Priority: formValue.priority ?? 'Medium'
    };

    this.complaintService.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/complaints'),
      error: () => this.router.navigateByUrl('/complaints')
    });
  }
}

