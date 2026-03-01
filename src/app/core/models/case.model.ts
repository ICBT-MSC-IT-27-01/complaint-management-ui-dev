export interface Case {
  id: number;
  caseNumber: string;
  complaintId: number;
  complaintNumber: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  status: string;
  notes?: string;
  openedAt: string;
  closedAt?: string;
}

export interface CaseActivity {
  id: number;
  caseId: number;
  activityType: string;
  description: string;
  performedByName: string;
  createdDateTime: string;
}

export interface AddCaseActivityRequest {
  activityType: string;
  description: string;
}

export interface UpdateCaseStatusRequest {
  status: string;
  note?: string;
}
