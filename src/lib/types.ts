export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskSource = 'user' | 'system' | 'accountant';
export type TaskArea = 'accounting' | 'taxes' | 'payroll' | 'documents' | 'general';

export interface Task {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  assignee_id?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  area: TaskArea;
  parent_task_id?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  last_reminder_sent?: string;
  reminder_count: number;
  external_reference?: string;
  metadata?: Record<string, any>;
}
export interface Company {
  id: string;
  name: string;
  uid_number: string;
  street: string;
  street_number: string;
  zip: string;
  city: string;
  country: string;
  created_at: string;
}
export interface AccountGroup {
  id: string;
  number: string;
  name: string;
  parent_id?: string | null;
  system_account?: string;
  created_at: string;
}

export interface AccountGroup {
  id: string;
  number: string;
  name: string;
  parent_id?: string;
  system_account?: string;
  created_at: string;
}

export interface TransactionPosition {
  id: string;
  debit_account_id: string;
  credit_account_id: string;
  tax_rate?: number;
  currency?: string;
  amount: number;
}
export interface Account {
  id: string;
  number: string;
  name: string;
  type: keyof typeof import('./constants').ACCOUNT_TYPES;
  group_id?: string | null;
  group?: AccountGroup;
  group_id?: string;
  group_id?: string;
  is_system?: boolean;
  created_at: string;
}

export interface AccountGroup {
  id: string;
  number: string;
  name: string;
  parent_id?: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  phone: string | null;
  street: string | null;
  street_number: string | null;
  zip: string | null;
  city: string | null;
  country: string | null;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  due_date?: string;
  service_period_start?: string;
  service_period_end?: string;
  due_date?: string;
  service_period_start?: string;
  service_period_end?: string;
  description: string;
  receipt_file?: File;
  receipt_path?: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number;
  document_ref?: string;
  issuer_company?: string;
  issuer_first_name?: string;
  issuer_last_name?: string;
  issuer_street?: string;
  issuer_zip?: string;
  issuer_city?: string;
  issuer_country?: string;
  created_at: string;
}

export interface TransactionPosition {
  id: string;
  account_id: string;
  tax_rate?: number;
  amount: number;
}

export interface Company {
  id: string;
  name: string;
  uid_number: string;
  address: string;
  created_at: string;
}

export interface Receipt {
  file: File;
  preview: string;
  processing?: boolean;
  processingText?: string;
  error?: string;
}