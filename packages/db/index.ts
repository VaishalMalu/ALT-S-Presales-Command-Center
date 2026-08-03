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

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL") || getEnvVar("VITE_SUPABASE_URL") || "http://127.0.0.1:9999";
const supabaseKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnvVar("VITE_SUPABASE_ANON_KEY") || "placeholder-key";

console.log("Supabase URL initialized:", supabaseUrl);

// Seed local storage with mock data if not already seeded
if (typeof window !== "undefined" && !localStorage.getItem("mock_db_seeded")) {
  const seedAccounts = [
    {
      id: "acc-1",
      name: "Acme Corporation",
      industry: "Technology",
      region: "North America",
      health_score: 92,
      ai_health_prediction: "Stable growth expected. Key renewal coming up in 6 months.",
      tier: "Tier 1",
      arr: 250000,
      renewal_date: "2027-02-15T00:00:00Z",
      upsell_potential: 50000,
      stakeholders: "John Doe (CIO), Jane Smith (VP of Engineering)",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      country: "United States",
      primary_contact: "John Doe",
      designation: "Chief Information Officer",
      phone_number: "+1-555-0199"
    },
    {
      id: "acc-2",
      name: "Globex Corporation",
      industry: "Manufacturing",
      region: "Europe",
      health_score: 78,
      ai_health_prediction: "At risk due to recent organizational changes. Engagement required.",
      tier: "Tier 2",
      arr: 120000,
      renewal_date: "2026-11-20T00:00:00Z",
      upsell_potential: 15000,
      stakeholders: "Robert Paulson (Director of Operations)",
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      country: "United Kingdom",
      primary_contact: "Robert Paulson",
      designation: "Director of Operations",
      phone_number: "+44-20-7946-0958"
    },
    {
      id: "acc-3",
      name: "Initech LLC",
      industry: "Finance",
      region: "Asia Pacific",
      health_score: 85,
      ai_health_prediction: "Highly positive sentiment. Strong expansion opportunity in Southeast Asia.",
      tier: "Tier 1",
      arr: 450000,
      renewal_date: "2027-05-10T00:00:00Z",
      upsell_potential: 120000,
      stakeholders: "Peter Gibbons (Head of Dev)",
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      country: "Singapore",
      primary_contact: "Peter Gibbons",
      designation: "Head of Development",
      phone_number: "+65-6789-0123"
    }
  ];

  const seedOpportunities = [
    {
      id: "opp-1",
      account_id: "acc-1",
      title: "Acme Enterprise Cloud Migration",
      type: "New Business",
      bid_type: "RFP",
      priority: "High",
      owner_id: "mock-user-id",
      owner: "Alex Johnson",
      probability: 75,
      deal_value: 150000,
      weighted_revenue: 112500,
      business_unit: "Cloud Services",
      stage: "Solution Design",
      ai_win_prediction: 82.5,
      deadline: "2026-10-15T18:00:00Z",
      pre_bid_kickoff_date: "2026-08-10T09:00:00Z",
      clarification_deadline: "2026-08-25T17:00:00Z",
      driven_by: "Jane Smith",
      competitors: "AWS Direct, Azure Enterprise",
      next_steps: "Present final solution architecture slides to CIO.",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "opp-2",
      account_id: "acc-2",
      title: "Globex Smart Factory IoT Implementation",
      type: "Expansion",
      bid_type: "RFI",
      priority: "Medium",
      owner_id: "mock-user-id",
      owner: "Sarah Lee",
      probability: 45,
      deal_value: 95000,
      weighted_revenue: 42750,
      business_unit: "IoT Solutions",
      stage: "Customer Requirement Analysis",
      ai_win_prediction: 48.0,
      deadline: "2026-12-05T18:00:00Z",
      pre_bid_kickoff_date: "2026-09-01T10:00:00Z",
      clarification_deadline: "2026-09-20T17:00:00Z",
      driven_by: "Robert Paulson",
      competitors: "Siemens MindSphere",
      next_steps: "Schedule on-site discovery workshop.",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "opp-3",
      account_id: "acc-3",
      title: "Initech Core Banking Platform Upgrade",
      type: "New Business",
      bid_type: "RFP",
      priority: "Critical",
      owner_id: "mock-user-id",
      owner: "Alex Johnson",
      probability: 90,
      deal_value: 380000,
      weighted_revenue: 342000,
      business_unit: "Banking Solutions",
      stage: "Negotiation",
      ai_win_prediction: 94.2,
      deadline: "2026-09-01T18:00:00Z",
      pre_bid_kickoff_date: "2026-07-15T09:00:00Z",
      clarification_deadline: "2026-07-30T17:00:00Z",
      driven_by: "Peter Gibbons",
      competitors: "Temenos, Oracle Financials",
      next_steps: "Finalize contract terms and SLAs with procurement.",
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const seedContacts = [
    {
      id: "con-1",
      account_id: "acc-1",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@acme.com",
      phone: "+1-555-0199",
      designation: "Chief Information Officer",
      department: "Information Technology",
      role: "Decision Maker",
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "con-2",
      account_id: "acc-1",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@acme.com",
      phone: "+1-555-0124",
      designation: "VP of Engineering",
      department: "Engineering",
      role: "Technical Influencer",
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "con-3",
      account_id: "acc-2",
      first_name: "Robert",
      last_name: "Paulson",
      email: "r.paulson@globex.com",
      phone: "+44-20-7946-0958",
      designation: "Director of Operations",
      department: "Operations",
      role: "Sponsor",
      created_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "con-4",
      account_id: "acc-3",
      first_name: "Peter",
      last_name: "Gibbons",
      email: "pgibbons@initech.com",
      phone: "+65-6789-0123",
      designation: "Head of Development",
      department: "Engineering",
      role: "Decision Maker",
      created_at: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const seedBids = [
    {
      id: "bid-1",
      opportunity_id: "opp-1",
      submission_deadline: "2026-10-15T18:00:00Z",
      status: "In Preparation",
      approval_status: "Pending Review",
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "bid-2",
      opportunity_id: "opp-3",
      submission_deadline: "2026-09-01T18:00:00Z",
      status: "Submitted",
      approval_status: "Approved",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const seedTasks = [
    {
      id: "tsk-1",
      opportunity_id: "opp-1",
      account_id: "acc-1",
      title: "Prepare Solution Architecture Diagram",
      description: "Draw dynamic block diagrams explaining VPC peering, regional replicas, and private link configuration.",
      category: "Solution Design",
      status: "In Progress",
      priority: "High",
      bottleneck_type: "None",
      assignee_id: "mock-user-id",
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      ai_suggested_priority: "High",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "tsk-2",
      opportunity_id: "opp-2",
      account_id: "acc-2",
      title: "Draft Initial RFx Questionnaire Responses",
      description: "Compile answers to security and compliance questions (SOC2, GDPR compliance info).",
      category: "Bid Preparation",
      status: "Not Started",
      priority: "Medium",
      bottleneck_type: "None",
      assignee_id: "mock-user-id",
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      ai_suggested_priority: "Medium",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "tsk-3",
      opportunity_id: "opp-3",
      account_id: "acc-3",
      title: "Procurement Pricing Review Session",
      description: "Conduct financial walkthrough to review margin guidelines and volume discounts.",
      category: "Commercials",
      status: "Waiting Internal",
      priority: "Critical",
      bottleneck_type: "Legal Review",
      assignee_id: "mock-user-id",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      ai_suggested_priority: "Critical",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  localStorage.setItem("mock_db_accounts", JSON.stringify(seedAccounts));
  localStorage.setItem("mock_db_opportunities", JSON.stringify(seedOpportunities));
  localStorage.setItem("mock_db_contacts", JSON.stringify(seedContacts));
  localStorage.setItem("mock_db_bids", JSON.stringify(seedBids));
  localStorage.setItem("mock_db_tasks", JSON.stringify(seedTasks));
  localStorage.setItem("mock_db_seeded", "true");
}

// Mock Query Chain Classes for mock mode
class MockQueryChain {
  table: string;
  data: any[];
  operation: string;
  updates?: any;
  filters: Array<{ field: string; value: any }> = [];
  sortField?: string;
  ascending?: boolean;

  constructor(table: string, data: any[], operation: string, updates?: any) {
    this.table = table;
    this.data = data;
    this.operation = operation;
    this.updates = updates;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.sortField = field;
    this.ascending = options?.ascending !== false;
    return this;
  }

  select() {
    return this;
  }

  single() {
    return this.then(
      (res: any) => ({ data: res.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : null, error: null }),
      (err: any) => ({ data: null, error: err })
    );
  }

  async then(onfulfilled?: any, onrejected?: any) {
    try {
      let result = [...this.data];

      if (this.filters.length > 0) {
        if (this.operation === "update") {
          const allDataStr = localStorage.getItem(`mock_db_${this.table}`);
          const allData = allDataStr ? JSON.parse(allDataStr) : [];
          
          let updatedItem: any = null;
          const newAllData = allData.map((item: any) => {
            let match = true;
            for (const filter of this.filters) {
              if (item[filter.field] !== filter.value) {
                match = false;
              }
            }
            if (match) {
              updatedItem = { ...item, ...this.updates, updated_at: new Date().toISOString() };
              return updatedItem;
            }
            return item;
          });
          
          localStorage.setItem(`mock_db_${this.table}`, JSON.stringify(newAllData));
          result = updatedItem ? [updatedItem] : [];
        } else if (this.operation === "delete") {
          const allDataStr = localStorage.getItem(`mock_db_${this.table}`);
          const allData = allDataStr ? JSON.parse(allDataStr) : [];
          
          const newAllData = allData.filter((item: any) => {
            let match = true;
            for (const filter of this.filters) {
              if (item[filter.field] !== filter.value) {
                match = false;
              }
            }
            return !match;
          });
          
          localStorage.setItem(`mock_db_${this.table}`, JSON.stringify(newAllData));
          result = [];
        } else {
          result = result.filter(item => {
            for (const filter of this.filters) {
              if (item[filter.field] !== filter.value) return false;
            }
            return true;
          });
        }
      }

      if (this.sortField) {
        const field = this.sortField;
        const asc = this.ascending;
        result.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === valB) return 0;
          if (valA == null) return 1;
          if (valB == null) return -1;
          const comparison = valA < valB ? -1 : 1;
          return asc ? comparison : -comparison;
        });
      }

      let responseData: any = result;
      if (this.operation === "insert") {
        responseData = this.data;
      }

      const res = { data: responseData, error: null };
      return onfulfilled ? onfulfilled(res) : res;
    } catch (err) {
      if (onrejected) return onrejected(err);
      return { data: null, error: err };
    }
  }
}

class MockQueryBuilder {
  table: string;
  constructor(table: string) {
    this.table = table;
  }
  
  private getData(): any[] {
    const dataStr = localStorage.getItem(`mock_db_${this.table}`);
    return dataStr ? JSON.parse(dataStr) : [];
  }
  
  private setData(data: any[]) {
    localStorage.setItem(`mock_db_${this.table}`, JSON.stringify(data));
  }

  select(columns?: string) {
    return new MockQueryChain(this.table, this.getData(), "select");
  }

  insert(values: any[]) {
    const current = this.getData();
    const newRecords = values.map(v => ({
      id: v.id || Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...v
    }));
    this.setData([...newRecords, ...current]);
    return new MockQueryChain(this.table, newRecords, "insert");
  }

  update(updates: any) {
    return new MockQueryChain(this.table, this.getData(), "update", updates);
  }

  delete() {
    return new MockQueryChain(this.table, this.getData(), "delete");
  }
}

const mockListeners: Array<(event: string, session: any) => void> = [];

const mockSupabase = {
  auth: {
    async getSession() {
      if (typeof window === "undefined") return { data: { session: null }, error: null };
      const sessionStr = localStorage.getItem("mock_supabase_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      return { data: { session }, error: null };
    },
    async signInWithPassword({ email, password }: any) {
      if (email === "admin@alt-s.com" && password !== "admin") {
        return { data: { session: null, user: null }, error: { message: "Invalid login credentials" } };
      }
      const session = {
        access_token: "mock-token-" + Math.random(),
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: {
          id: "mock-user-id-" + email,
          email: email,
          role: "authenticated",
          aud: "authenticated",
          created_at: new Date().toISOString(),
        }
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("mock_supabase_session", JSON.stringify(session));
      }
      mockListeners.forEach(cb => cb("SIGNED_IN", session));
      return { data: { session, user: session.user }, error: null };
    },
    onAuthStateChange(callback: any) {
      mockListeners.push(callback);
      let session = null;
      if (typeof window !== "undefined") {
        const sessionStr = localStorage.getItem("mock_supabase_session");
        session = sessionStr ? JSON.parse(sessionStr) : null;
      }
      setTimeout(() => callback("INITIAL_SESSION", session), 0);
      return {
        data: {
          subscription: {
            unsubscribe() {
              const idx = mockListeners.indexOf(callback);
              if (idx !== -1) mockListeners.splice(idx, 1);
            }
          }
        }
      };
    },
    async signOut() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock_supabase_session");
      }
      mockListeners.forEach(cb => cb("SIGNED_OUT", null));
      return { error: null };
    }
  },
  from(table: string) {
    return new MockQueryBuilder(table);
  },
  async rpc(name: string, args: any) {
    return { data: null, error: { message: "RPC not found" } };
  }
};

export const supabase = supabaseUrl === "http://127.0.0.1:9999"
  ? (mockSupabase as any)
  : createClient(supabaseUrl, supabaseKey);

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
