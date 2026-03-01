export type UserRole = 'Admin' | 'Supervisor' | 'Agent' | 'Client';

export interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  data: T;
}
