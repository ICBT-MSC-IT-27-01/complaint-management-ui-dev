export interface PermissionMatrixItem {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface ApiRolePermissionItem {
  module?: string;
  Module?: string;
  canRead?: boolean;
  CanRead?: boolean;
  canWrite?: boolean;
  CanWrite?: boolean;
  canDelete?: boolean;
  CanDelete?: boolean;
}

export interface SaveRolePermissionsPayload {
  role: string;
  permissions: ApiRolePermissionItem[];
}

export interface RoleItem {
  id?: number;
  role?: string;
  displayName?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

export interface PermissionAuditItem {
  id?: number;
  role?: string;
  action?: string;
  changedBy?: string;
  changedDateTime?: string;
  createdDateTime?: string;
  details?: string;
}
