
export enum TaskStage {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  WAITING = 'Waiting on Client',
  DONE = 'Done'
}

export enum TaskCategory {
  LEGAL = 'Legal',
  ADMIN = 'Admin',
  FINANCE = 'Finance',
  HR = 'HR'
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum BillingType {
  FIXED = 'Fixed',
  HOURLY = 'Hourly',
  TRUST = 'Trust'
}

export enum ExpenseCategory {
  OFFICE = 'Office Supply',
  TRAVEL = 'Travel & Transport',
  COURT_FEES = 'Court & Filing Fees',
  PROFESSIONAL = 'Professional Services',
  MISC = 'Miscellaneous'
}

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  VOID = 'Void'
}

export enum EventType {
  COURT = 'Court Appearance',
  FILING = 'Filing Deadline',
  MEETING = 'Client Meeting',
  INTERNAL = 'Internal'
}

export interface Client {
  id: string;
  name: string;
  type: 'Corporate' | 'Individual' | 'Government';
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  matter_id?: string;
  lawyer_assigned: string;
  description: string;
}

export interface LegalPrecedent {
  id: string;
  title: string;
  category: string;
  version: string;
  last_updated: string;
}

export interface TaskMetadata {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  case_number?: string;
  client_name?: string;
  lawyer_assigned?: string;
  deadline?: string;
  matter_id?: string;
}

export interface Workflow {
  stage: TaskStage;
  estimated_hours: number;
  billable_hours: number;
  is_billable: boolean;
}

export interface Financials {
  suggested_fee: number;
  tax_amount: number;
  total_inclusive: number;
  billing_type: BillingType;
  trust_balance: number;
  is_invoiced: boolean;
}

export interface LegalTask {
  id: string;
  raw_input: string;
  task_metadata: TaskMetadata;
  workflow: Workflow;
  financials: Financials;
  created_at: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  matter_id?: string;
  is_reimbursable: boolean;
  is_invoiced: boolean;
}

export interface TimeEntry {
  id: string;
  matter_id: string;
  date: string;
  hours: number;
  description: string;
  lawyer_name: string;
  is_invoiced: boolean;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  type: 'Professional Services' | 'Disbursement';
}

export interface Invoice {
  id: string;
  matter_id: string;
  client_name: string;
  title: string;
  date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
}
