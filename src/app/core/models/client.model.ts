export interface Client {
  id: number;
  clientCode: string;
  companyName: string;
  primaryEmail: string;
  primaryPhone?: string;
  address?: string;
  clientType: string;
  accountManagerId?: number;
  accountManagerName?: string;
  isActive: boolean;
  createdDateTime: string;
}

export interface CreateClientRequest {
  companyName: string;
  primaryEmail: string;
  primaryPhone?: string;
  address?: string;
  clientType: string;
  accountManagerId?: number;
}

export interface ClientSearchRequest {
  q?: string;
  clientType?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
