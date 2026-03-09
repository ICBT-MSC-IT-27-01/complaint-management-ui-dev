export type UserRole =
  | 'Admin'
  | 'Supervisor'
  | 'Agent'
  | 'Client'
  | 'Call Center Agent'
  | 'Technical Engineer'
  | 'Billing Officer'
  | 'Manager'
  | 'System Administrator';

export interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  data: T;
}
