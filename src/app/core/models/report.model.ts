export interface DashboardData {
  totalComplaints: number;
  openComplaints: number;
  resolvedToday: number;
  slaBreached: number;
  slaAtRisk: number;
  slaCompliancePercent?: number;
  avgResolutionHours?: number;
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

export interface ComplaintsSummaryReport {
  totalComplaints?: number;
  openComplaints?: number;
  resolvedComplaints?: number;
  pendingReviews?: number;
  slaCompliancePercent?: number;
  avgResolutionHours?: number;
  agentStats?: AgentPerformanceStat[];
  categoryStats?: CategoryCountStat[];
}

export interface AgentPerformanceStat {
  userId?: number;
  agentName?: string;
  assigned?: number;
  resolved?: number;
  avgResolutionHours?: number;
}

export interface CategoryCountStat {
  category?: string;
  count?: number;
}
