import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateComplaintRequest } from '@core/models/complaint.model';
import { ComplaintService } from '@core/services/complaint.service';
import { contactNumberValidator, nonNegativeNumberValidator, showValidationAlert, textFieldValidator, trimFormValues } from '@core/utils/form-validation.util';

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
    clientId: [null as number | null, nonNegativeNumberValidator()],
    clientName: ['', textFieldValidator()],
    clientEmail: ['', Validators.email],
    clientMobile: ['', contactNumberValidator()],
    complaintChannelId: [2, Validators.required],
    complaintCategoryId: [1, [Validators.required, nonNegativeNumberValidator()]],
    subCategoryId: [null as number | null, nonNegativeNumberValidator()],
    subject: ['', [Validators.required, textFieldValidator(true)]],
    description: ['', [Validators.required, textFieldValidator(true)]],
    priority: ['Medium', Validators.required]
  });

  submit(): void {
    trimFormValues(this.form, ['clientName', 'clientEmail', 'clientMobile', 'subject', 'description']);
    if (this.form.invalid) {
      showValidationAlert(this.form, {
        clientId: { label: 'Client ID', type: 'number' },
        clientName: { label: 'Client Name', type: 'text' },
        clientEmail: { label: 'Client Email', type: 'email' },
        clientMobile: { label: 'Client Mobile', type: 'contact' },
        complaintCategoryId: { label: 'Complaint Category ID', type: 'number' },
        subCategoryId: { label: 'Sub Category ID', type: 'number' },
        subject: { label: 'Subject', type: 'text' },
        description: { label: 'Description', type: 'text' }
      });
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

