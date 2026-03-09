export interface Attachment {
  id: number;
  complaintId: number;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedByName: string;
  uploadedAt: string;
}
