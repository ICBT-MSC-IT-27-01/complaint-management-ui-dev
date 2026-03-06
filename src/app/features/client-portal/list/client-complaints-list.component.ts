import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Complaint } from '@core/models/complaint.model';
import { ComplaintService } from '@core/services/complaint.service';
import { StatusPillComponent } from '@shared/components/status-pill/status-pill.component';

@Component({
  selector: 'app-client-complaints-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusPillComponent],
  templateUrl: './client-complaints-list.component.html',
  styleUrl: './client-complaints-list.component.scss'
})
export class ClientComplaintsListComponent implements OnInit {
  private readonly complaintService = inject(ComplaintService);

  readonly complaints = signal<Complaint[]>([]);

  ngOnInit(): void {
    this.complaintService.listClientPortalComplaints().subscribe({
      next: (res) => {
        if (res.isSuccess) this.complaints.set(res.data ?? []);
      },
      error: () => this.complaints.set([])
    });
  }

  rowId(item: Complaint): number {
    const c = item as Complaint & { id?: number };
    return item.Id ?? c.id ?? 0;
  }

  complaintIdOf(item: Complaint): number {
    const c = item as Complaint & { id?: number };
    return item.Id ?? c.id ?? 0;
  }

  complaintNumberOf(item: Complaint): string {
    const c = item as Complaint & { complaintNumber?: string };
    return item.ComplaintNumber ?? c.complaintNumber ?? '-';
  }

  clientNameOf(item: Complaint): string {
    const c = item as Complaint & { clientName?: string };
    return item.ClientName ?? c.clientName ?? '-';
  }

  statusOf(item: Complaint): string {
    const c = item as Complaint & { status?: string };
    return item.Status ?? c.status ?? '-';
  }

  priorityOf(item: Complaint): string {
    const c = item as Complaint & { priority?: string };
    return item.Priority ?? c.priority ?? '-';
  }

  sourceOf(item: Complaint): string {
    const c = item as Complaint & { channel?: string; source?: string };
    return item.Channel ?? c.channel ?? c.source ?? '-';
  }
}
