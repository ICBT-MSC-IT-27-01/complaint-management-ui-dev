export interface LoginRequest {
  EmailOrUsername: string;
  Password: string;
}

export interface CheckEmailRequest {
  EmailOrUsername: string;
  Password: string;
}

export interface ClientRegisterRequest {
  Name: string;
  Email: string;
  PhoneNumber: string;
  Password: string;
  ConfirmPassword: string;
}

export interface ClientEmailCheckResponse {
  Email: string;
  EmailExists: boolean;
  RequiresPassword: boolean;
  RequiresRegistration: boolean;
}

export interface LoginResponse {
  userId: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  accessToken: string;
  expiresAtUtc: string;
  sessionId?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthUser {
  userId: number;
  email: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'Supervisor' | 'Agent' | 'Client';
  accessToken: string;
  sessionId?: string;
  twoFactorEnabled?: boolean;
}

export interface ForgotPasswordRequest {
  Email: string;
}

export interface ResetPasswordRequest {
  Email: string;
  ResetToken: string;
  NewPassword: string;
  ConfirmPassword: string;
}
