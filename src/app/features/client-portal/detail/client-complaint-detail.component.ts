import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Complaint } from '@core/models/complaint.model';
import { ComplaintService } from '@core/services/complaint.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-client-complaint-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-complaint-detail.component.html',
  styleUrl: './client-complaint-detail.component.scss'
})
export class ClientComplaintDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly complaintService = inject(ComplaintService);
  private readonly auth = inject(AuthService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly complaint = signal<Complaint | null>(null);

  ngOnInit(): void {
    if (!this.id || Number.isNaN(this.id)) return;
    this.complaintService.getById(this.id).subscribe({
      next: (res) => {
        if (!res.isSuccess) return;
        const me = this.auth.currentUser();
        const myUserId = me?.userId ?? 0;
        const myEmail = (me?.email ?? '').trim().toLowerCase();

        if (!this.isMine(res.data, myUserId, myEmail)) {
          this.router.navigate(['/unauthorized']);
          return;
        }

        this.complaint.set(res.data);
      },
      error: () => {
        this.router.navigate(['/unauthorized']);
      }
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
}

