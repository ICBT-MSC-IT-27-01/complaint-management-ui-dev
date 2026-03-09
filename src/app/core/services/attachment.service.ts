import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/models/api-response.model';
import { Attachment } from '@core/models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private http = inject(HttpClient);

  getByComplaintId(complaintId: number): Observable<ApiResponse<Attachment[]>> {
    return this.http.get<ApiResponse<Attachment[]>>(`${environment.apiUrl}/complaints/${complaintId}/attachments`);
  }

  upload(complaintId: number, file: File): Observable<ApiResponse<Attachment>> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<Attachment>>(`${environment.apiUrl}/complaints/${complaintId}/attachments`, form);
  }

  delete(complaintId: number, id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${environment.apiUrl}/complaints/${complaintId}/attachments/${id}`);
  }
}
