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
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  password: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
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
