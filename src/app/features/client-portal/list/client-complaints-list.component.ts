import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Complaint } from '@core/models/complaint.model';
import { ComplaintService } from '@core/services/complaint.service';
import { AuthService } from '@core/services/auth.service';
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
  private readonly auth = inject(AuthService);

  readonly complaints = signal<Complaint[]>([]);

  ngOnInit(): void {
    this.complaintService.search({ Page: 1, PageSize: 10 }).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;

        const me = this.auth.currentUser();
        const myUserId = me?.userId ?? 0;
        const myEmail = (me?.email ?? '').trim().toLowerCase();
        const items = res.data.items ?? [];
        const mine = items.filter((item) => this.isMine(item, myUserId, myEmail));
        this.complaints.set(mine);
      },
      error: () => this.complaints.set([])
    });
  }

  private isMine(item: Complaint, myUserId: number, myEmail: string): boolean {
    const c = item as Complaint & { createdBy?: number; clientEmail?: string; clientId?: number };
    const createdBy = item.CreatedBy ?? c.createdBy ?? 0;
    const clientId = item.ClientId ?? c.clientId ?? 0;
    const complaintEmail = (item.ClientEmail ?? c.clientEmail ?? '').trim().toLowerCase();

    if (myUserId > 0 && (createdBy === myUserId || clientId === myUserId)) return true;
    if (myEmail && complaintEmail === myEmail) return true;
    return false;
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
