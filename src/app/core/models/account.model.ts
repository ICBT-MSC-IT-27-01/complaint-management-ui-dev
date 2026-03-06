export interface AccountSession {
  sessionId: string;
  device?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  current?: boolean;
}

export interface TwoFactorSetupResponse {
  secret?: string;
  qrCodeUrl?: string;
  manualEntryKey?: string;
}

export interface EnableTwoFactorRequest {
  code: string;
}
