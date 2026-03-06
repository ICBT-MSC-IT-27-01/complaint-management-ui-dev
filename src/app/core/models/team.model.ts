export interface Team {
  Id: number;
  Name: string;
  LeadUserId?: number;
  LeadName?: string;
  MemberCount?: number;
  IsArchived?: boolean;
  IsActive?: boolean;
  CreatedDateTime?: string;
}

export interface CreateTeamRequest {
  Name: string;
  LeadUserId?: number;
  Description?: string;
}
