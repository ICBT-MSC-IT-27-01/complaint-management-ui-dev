export interface AccountSession {
  sessionId?: string;
  deviceId?: string;
  issuedAtUtc?: string;
  lastSeenAtUtc?: string;
  expiresAtUtc?: string;
  isActive?: boolean;
  // Legacy compatibility fields
  device?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  current?: boolean;
}

export interface TwoFactorSetupResponse {
  secret?: string;
  qrCodeUri?: string;
  demoVerificationCode?: string;
  // Legacy compatibility fields
  qrCodeUrl?: string;
  manualEntryKey?: string;
}

export interface EnableTwoFactorRequest {
  verificationCode: string;
}
