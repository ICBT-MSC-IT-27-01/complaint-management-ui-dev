import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Complaint } from '@core/models/complaint.model';
import { ComplaintService } from '@core/services/complaint.service';

@Component({
  selector: 'app-client-complaint-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-complaint-detail.component.html',
  styleUrl: './client-complaint-detail.component.scss'
})
export class ClientComplaintDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly complaintService = inject(ComplaintService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly complaint = signal<Complaint | null>(null);
  readonly loading = signal(true);
  replyMessage = '';
  errorMsg = '';
  successMsg = '';

  ngOnInit(): void {
    if (!this.id || Number.isNaN(this.id)) {
      this.loading.set(false);
      return;
    }

    this.complaintService.getById(this.id).subscribe({
      next: (res) => {
        if (!res.isSuccess) {
          this.loading.set(false);
          return;
        }

        this.complaint.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/unauthorized']);
      }
    });
  }

  sendReply(): void {
    const message = this.replyMessage.trim();
    if (!message) {
      this.errorMsg = 'Reply message is required.';
      this.successMsg = '';
      return;
    }

    this.errorMsg = '';
    this.successMsg = '';

    this.complaintService.replyFromClientPortal(this.id, { Message: message }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.replyMessage = '';
          this.successMsg = res.message || 'Reply sent successfully.';
          return;
        }
        this.errorMsg = res.message || 'Unable to send reply.';
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Unable to send reply.';
      }
    });
  }
}

