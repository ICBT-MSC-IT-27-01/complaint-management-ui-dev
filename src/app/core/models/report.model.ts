export interface DashboardData {
  totalComplaints: number;
  openComplaints: number;
  resolvedToday: number;
  slaBreached: number;
  slaAtRisk: number;
  myOpenComplaints: number;
  byStatus: StatusCount[];
  byPriority: PriorityCount[];
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface PriorityCount {
  priority: string;
  count: number;
}

export interface ReportFilterRequest {
  from?: string;
  to?: string;
  agentUserId?: number;
  categoryId?: number;
}
