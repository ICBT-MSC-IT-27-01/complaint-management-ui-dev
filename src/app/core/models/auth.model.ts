export interface LoginRequest {
  EmailOrUsername: string;
  Password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  accessToken: string;
  expiresAtUtc: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'Supervisor' | 'Agent' | 'Client';
  accessToken: string;
}
