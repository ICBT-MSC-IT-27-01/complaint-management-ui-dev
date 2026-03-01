import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Complaint } from '@core/models/complaint.model';
import { ComplaintService } from '@core/services/complaint.service';

@Component({
  selector: 'app-client-complaint-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-complaint-detail.component.html',
  styleUrl: './client-complaint-detail.component.scss'
})
export class ClientComplaintDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly complaintService = inject(ComplaintService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly complaint = signal<Complaint | null>(null);

  ngOnInit(): void {
    if (!this.id || Number.isNaN(this.id)) return;
    this.complaintService.getById(this.id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.complaint.set(res.data);
      }
    });
  }
}

