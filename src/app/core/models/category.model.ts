export interface Category {
  id: number;
  name: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  parentCategoryId?: number;
  sortOrder?: number;
}

export interface SlaPolicy {
  id: number;
  categoryId: number;
  categoryName: string;
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationThresholdPct: number;
  isActive: boolean;
}

export interface CreateSlaPolicyRequest {
  categoryId: number;
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationThresholdPct?: number;
}
