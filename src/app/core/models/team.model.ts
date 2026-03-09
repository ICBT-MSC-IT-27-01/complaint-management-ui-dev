export interface Team {
  Id?: number;
  id?: number;
  TeamCode?: string;
  teamCode?: string;
  TeamName?: string;
  teamName?: string;
  LeadUserId?: number;
  leadUserId?: number;
  LeadName?: string;
  leadName?: string;
  IsActive?: boolean;
  isActive?: boolean;
  MemberCount?: number;
  memberCount?: number;
  CreatedDateTime?: string;
  createdDateTime?: string;
  Members?: TeamMember[];
  members?: TeamMember[];
}

export interface TeamMember {
  UserId?: number;
  userId?: number;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Role?: string;
  role?: string;
}

export interface TeamSearchRequest {
  q?: string;
  isActive?: boolean | null;
  page?: number;
  pageSize?: number;
}

export interface CreateTeamRequest {
  TeamName: string;
  LeadUserId?: number;
}

export interface UpdateTeamRequest {
  TeamName: string;
  LeadUserId?: number;
  IsActive: boolean;
}

export interface AssignTeamMemberRequest {
  UserId: number;
}
