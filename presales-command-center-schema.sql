-- presales-command-center-schema.sql
-- Run this script in the Supabase SQL Editor.

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector

-- 2. Define Enum Types for the State Machine & Core Fields
DO $$ BEGIN
    CREATE TYPE opportunity_stage AS ENUM (
        'Lead Created',
        'Customer Qualification',
        'Opportunity Creation',
        'Customer Requirement Analysis',
        'Bid Qualification',
        'RFP/RFI/RFQ Management',
        'Solution Design',
        'Technical Proposal',
        'Commercial Proposal',
        'Internal Approval Workflow',
        'Proposal Submission',
        'Customer Clarification',
        'Negotiation',
        'Decision',
        'Closed Won',
        'Closed Lost'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'Not Started',
        'In Progress',
        'Waiting Customer',
        'Waiting Internal',
        'Completed',
        'Blocked'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Core Tables

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    region VARCHAR(100),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    ai_health_prediction TEXT,
    tier VARCHAR(50),
    arr NUMERIC(15, 2),
    renewal_date TIMESTAMPTZ,
    upsell_potential NUMERIC(15, 2),
    stakeholders TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Opportunities Table (The Spine)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    bid_type VARCHAR(100),
    priority VARCHAR(50),
    owner_id UUID REFERENCES auth.users(id),
    probability NUMERIC(5, 2) CHECK (probability >= 0 AND probability <= 100),
    deal_value NUMERIC(15, 2),
    weighted_revenue NUMERIC(15, 2),
    business_unit VARCHAR(100),
    stage opportunity_stage DEFAULT 'Lead Created',
    ai_win_prediction NUMERIC(5, 2),
    deadline TIMESTAMPTZ,
    driven_by VARCHAR(255),
    competitors TEXT,
    next_steps TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity State History (Audit Log for State Machine)
CREATE TABLE IF NOT EXISTS opportunity_state_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    from_stage opportunity_stage,
    to_stage opportunity_stage NOT NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    submission_deadline TIMESTAMPTZ,
    status VARCHAR(100),
    approval_status VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status task_status DEFAULT 'Not Started',
    priority task_priority DEFAULT 'Medium',
    bottleneck_type VARCHAR(100),
    assignee_id UUID REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    ai_suggested_priority task_priority,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Updated to allow public/anon access for development)
-- In a real scenario, this would check RBAC tables or JWT claims.
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read on accounts" ON accounts;
    DROP POLICY IF EXISTS "Allow authenticated insert on accounts" ON accounts;
    DROP POLICY IF EXISTS "Allow authenticated update on accounts" ON accounts;
    CREATE POLICY "Allow public read on accounts" ON accounts FOR SELECT USING (true);
    CREATE POLICY "Allow public insert on accounts" ON accounts FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update on accounts" ON accounts FOR UPDATE USING (true);
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read on opportunities" ON opportunities;
    DROP POLICY IF EXISTS "Allow authenticated insert on opportunities" ON opportunities;
    DROP POLICY IF EXISTS "Allow authenticated update on opportunities" ON opportunities;
    CREATE POLICY "Allow public read on opportunities" ON opportunities FOR SELECT USING (true);
    CREATE POLICY "Allow public insert on opportunities" ON opportunities FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update on opportunities" ON opportunities FOR UPDATE USING (true);
EXCEPTION WHEN others THEN null; END $$;


-- Repeat basic public policies for other tables
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read on opportunity_state_history" ON opportunity_state_history;
    DROP POLICY IF EXISTS "Allow authenticated insert on opportunity_state_history" ON opportunity_state_history;
    CREATE POLICY "Allow public read on opportunity_state_history" ON opportunity_state_history FOR SELECT USING (true);
    CREATE POLICY "Allow public insert on opportunity_state_history" ON opportunity_state_history FOR INSERT WITH CHECK (true);
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read on bids" ON bids;
    DROP POLICY IF EXISTS "Allow authenticated insert on bids" ON bids;
    DROP POLICY IF EXISTS "Allow authenticated update on bids" ON bids;
    CREATE POLICY "Allow public read on bids" ON bids FOR SELECT USING (true);
    CREATE POLICY "Allow public insert on bids" ON bids FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update on bids" ON bids FOR UPDATE USING (true);
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read on tasks" ON tasks;
    DROP POLICY IF EXISTS "Allow authenticated insert on tasks" ON tasks;
    DROP POLICY IF EXISTS "Allow authenticated update on tasks" ON tasks;
    CREATE POLICY "Allow public read on tasks" ON tasks FOR SELECT USING (true);
    CREATE POLICY "Allow public insert on tasks" ON tasks FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update on tasks" ON tasks FOR UPDATE USING (true);
EXCEPTION WHEN others THEN null; END $$;

-- 6. Storage Buckets (if storage schema exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('proposals', 'proposals', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('rfps', 'rfps', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false) ON CONFLICT DO NOTHING;

-- 7. Knowledge Base for RAG (pgvector)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536), -- Dimension size for OpenAI text-embedding-3-small/ada-002
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast nearest neighbor search
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
ON knowledge_base USING hnsw (embedding vector_cosine_ops);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read on knowledge_base" ON knowledge_base FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated insert on knowledge_base" ON knowledge_base FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    designation TEXT,
    department TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public read on contacts" ON contacts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public insert on contacts" ON contacts FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public update on contacts" ON contacts FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_contacts_updated_at
        BEFORE UPDATE ON contacts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Adding Missing Opportunity Fields
DO $$ BEGIN
    ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS owner VARCHAR(255);
    ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS pre_bid_kickoff_date TIMESTAMPTZ;
    ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS clarification_deadline TIMESTAMPTZ;
    ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS win_loss_reason TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;
