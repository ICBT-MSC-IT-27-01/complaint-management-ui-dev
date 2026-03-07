export interface Department {
  Id: number;
  DepartmentCode: string;
  Name: string;
  Description: string;
  SortOrder: number;
  IsActive: boolean;
  CreatedDateTime?: string;
}

export interface DepartmentSearchRequest {
  q?: string;
  isActive?: boolean | null;
  page?: number;
  pageSize?: number;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateDepartmentRequest {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive: boolean;
}
