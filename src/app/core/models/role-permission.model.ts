export interface PermissionMatrixItem {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface RolePermissionsPayload {
  role: string;
  permissions: PermissionMatrixItem[];
}

export interface PermissionAuditItem {
  id?: number;
  role?: string;
  action?: string;
  changedBy?: string;
  createdDateTime?: string;
}
