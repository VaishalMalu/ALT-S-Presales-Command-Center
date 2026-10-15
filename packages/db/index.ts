import { createClient } from "@supabase/supabase-js";

// Helper to safely get env vars in both Vite (import.meta.env) and Next.js (process.env)
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

const supabaseUrl =
  getEnvVar("NEXT_PUBLIC_SUPABASE_URL") ||
  getEnvVar("VITE_SUPABASE_URL") ||
  "https://iovjpynbhxuhmrpotmkb.supabase.co";

const supabaseKey =
  getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  getEnvVar("VITE_SUPABASE_ANON_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdmpweW5iaHh1aG1ycG90bWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzU4MjksImV4cCI6MjEwMTA1MTgyOX0.1NSbqrLZXhl4KfkMMXOxXDLaFcPnlYjSSNqXHEzC3O8";

// Clean up any stale mock database cache in the browser
if (typeof window !== "undefined") {
  [
    "mock_db_accounts",
    "mock_db_opportunities",
    "mock_db_contacts",
    "mock_db_bids",
    "mock_db_tasks",
    "mock_db_audit_logs",
    "mock_db_seeded",
  ].forEach((k) => localStorage.removeItem(k));
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types mapping to presales-command-center-schema.sql
export type OpportunityStage =
  | "Lead Created"
  | "Customer Qualification"
  | "Opportunity Creation"
  | "Customer Requirement Analysis"
  | "Bid Qualification"
  | "RFP/RFI/RFQ Management"
  | "Solution Design"
  | "Technical Proposal"
  | "Commercial Proposal"
  | "Internal Approval Workflow"
  | "Proposal Submission"
  | "Proposal/RFP Submitted"
  | "Customer Clarification"
  | "Negotiation"
  | "Decision"
  | "Closed Won"
  | "Closed Lost";

export interface Opportunity {
  id: string;
  account_id: string | null;
  title: string;
  type: string | null;
  bid_type: string | null;
  priority: string | null;
  owner_id: string | null;
  owner: string | null;
  probability: number | null;
  deal_value: number | null;
  weighted_revenue: number | null;
  business_unit: string | null;
  stage: OpportunityStage;
  ai_win_prediction: number | null;
  deadline: string | null;
  received_date?: string | null;
  partner_name?: string | null;
  pre_bid_kickoff_date: string | null;
  clarification_deadline: string | null;
  driven_by: string | null;
  competitors: string | null;
  next_steps: string | null;
  win_loss_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityStateHistory {
  id: string;
  opportunity_id: string;
  changed_by: string | null;
  from_stage: OpportunityStage | null;
  to_stage: OpportunityStage;
  reason: string | null;
  changed_at: string;
}

export interface Account {
  id: string;
  name: string;
  owner: string | null;
  industry: string | null;
  region: string | null;
  health_score: number | null;
  ai_health_prediction: string | null;
  tier: string | null;
  arr: number | null;
  renewal_date: string | null;
  upsell_potential: number | null;
  stakeholders: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  country: string | null;
  primary_contact: string | null;
  designation: string | null;
  phone_number: string | null;
}

export interface Contact {
  id: string;
  account_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  department: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  opportunity_id: string;
  submission_deadline: string | null;
  status: string | null;
  approval_status: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Waiting Customer"
  | "Waiting Internal"
  | "Completed"
  | "Blocked";

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface Task {
  id: string;
  opportunity_id: string | null;
  account_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  bottleneck_type: string | null;
  assignee_id: string | null;
  due_date: string | null;
  ai_suggested_priority: TaskPriority | null;
  created_at: string;
  updated_at: string;
}
