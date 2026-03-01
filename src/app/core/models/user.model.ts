export interface User {
  Id: number;
  Name: string;
  Email: string;
  Username: string;
  PhoneNumber?: string;
  Role: string;
  IsActive: boolean;
  IsLocked: boolean;
  CreatedDateTime: string;
  LastLoginDateTime?: string;
}

export interface CreateUserRequest {
  Name: string;
  Email: string;
  Username: string;
  PhoneNumber?: string;
  Password: string;
  Role: string;
}

export interface UpdateUserRequest {
  Name: string;
  Email: string;
  Username: string;
  PhoneNumber?: string;
  Role: string;
  IsActive?: boolean;
}

export interface ChangePasswordRequest {
  CurrentPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}

export interface UserSearchRequest {
  Keyword?: string;
  Role?: string;
  IsActive?: boolean;
  Page?: number;
  PageSize?: number;
}
