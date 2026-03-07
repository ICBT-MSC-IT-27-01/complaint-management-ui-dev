export interface Complaint {
  Id: number;
  ComplaintNumber: string;
  Subject: string;
  Description: string;
  Priority: string;
  Status: string;
  ComplaintStatusId: number;
  ComplaintChannelId: number;
  Channel: string;
  ComplaintCategoryId: number;
  Category: string;
  SubCategoryId?: number;
  ClientId?: number;
  ClientName?: string;
  ClientEmail?: string;
  ClientMobile?: string;
  AssignedToUserId?: number;
  AssignedToName?: string;
  AssignedDate?: string;
  DueDate?: string;
  SlaStatus: string;
  IsSlaBreached: boolean;
  IsResolved: boolean;
  ResolvedDate?: string;
  ResolutionNotes?: string;
  IsClosed: boolean;
  ClosedDate?: string;
  CreatedDateTime: string;
  CreatedBy: number;
  CreatedByName: string;
  UpdatedDateTime?: string;
  IsActive: boolean;
}

export interface CreateComplaintRequest {
  ComplaintChannelId: number;
  ComplaintCategoryId: number;
  Subject: string;
  Description: string;
  Priority: string;
  ClientId?: number;
  ClientName?: string;
  ClientEmail?: string;
  ClientMobile?: string;
  SubCategoryId?: number;
}

export interface ComplaintSearchRequest {
  Q?: string;
  StatusId?: number;
  CategoryId?: number;
  ChannelId?: number;
  Priority?: string;
  AssignedToUserId?: number;
  From?: string;
  To?: string;
  Page?: number;
  PageSize?: number;
}

export interface AssignComplaintRequest {
  AssignedToUserId: number;
  DueDate?: string;
  Note?: string;
}

export interface EscalateComplaintRequest {
  Reason: string;
  EscalatedToUserId: number;
  EscalationType: string;
}

export interface ResolveComplaintRequest {
  ResolutionSummary: string;
  RootCause?: string;
  FixApplied?: string;
}

export interface UpdateStatusRequest {
  StatusId: number;
  Note?: string;
}

export interface ComplaintHistory {
  Id: number;
  Action: string;
  OldStatus?: string;
  NewStatus?: string;
  Note?: string;
  PerformedByName: string;
  CreatedDateTime: string;
}

export interface ClientPortalCreateComplaintRequest {
  ComplaintChannelId: number;
  ComplaintCategoryId: number;
  SubCategoryId?: number;
  Subject: string;
  Description: string;
  Priority: string;
}

export interface ClientPortalReplyRequest {
  Message: string;
}

export interface ComplaintSlaTimer {
  complaintId?: number;
  complaintNumber?: string;
  dueDateUtc?: string;
  remainingMinutes?: number;
  remainingText?: string;
  elapsedMinutes?: number;
  isBreached?: boolean;
  status?: string;
}
