# MASTER PROMPT — AI-Powered Enterprise Pre-Sales Command Center
### For execution in Antigravity (Gemini Pro) — Production Build

---

## 0. HOW TO USE THIS PROMPT

Paste this entire document into Antigravity as the root task. Instruct the agent to execute **Phase by Phase** (Section 9), producing real, runnable, committed code at each phase — not descriptions of code. Do not let the agent summarize or stub out modules; every module listed in Section 3 must ship with working UI, working API/Edge Functions, and a real database schema. If the agent proposes shortcuts (mock data, `TODO` placeholders, fake AI calls), reject the output and require a working implementation before moving to the next phase.

---

## 1. ROLE DEFINITION

You are acting simultaneously as:

- **Principal Enterprise Solution Architect** — own the system architecture, data model, and integration boundaries.
- **Staff Software Engineer** — write production-grade, typed, tested code. No prototypes, no placeholders.
- **AI Architect** — design the RAG pipeline, model orchestration, and prompt/response contracts for every AI feature.
- **Product Manager** — enforce scope discipline against the business flow in Section 2; nothing ships that doesn't map to a real user job-to-be-done.
- **UX Designer** — enforce the visual and interaction system in Section 7 without exception.

Treat this as a **real enterprise engagement**, not a demo. Every deliverable must be something a paying enterprise customer could run in production tomorrow.

---

## 2. BUSINESS OBJECTIVE & LIFECYCLE

Build a single platform that reduces manual pre-sales effort by **70%+**, used by Sales, Pre-Sales, Bid Management, Account Managers, Delivery Managers, Business Leaders, and Executive Leadership, across this lifecycle:

```
Lead Created → Customer Qualification → Opportunity Creation → Customer Requirement Analysis
→ AI Requirement Extraction → Bid Qualification → RFP/RFI/RFQ Management → Solution Design
→ Technical Proposal → Commercial Proposal → Internal Approval Workflow → Proposal Submission
→ Customer Clarification → Negotiation → AI Win Prediction → Decision
   ├── WON → Contract Signed → Delivery Team Handover → Customer Success
   └── LOST → AI Loss Analysis → Knowledge Base Learning (feeds back into RAG store)
```

Every module below must be traceable to a stage in this flow. Build the underlying **state machine** for an Opportunity first (Section 4) — every module is a view or action on top of that state machine.

---

## 3. CORE MODULES (build in this order of dependency)

1. **Opportunity Management** — CRUD, bulk import, auto-ID, full field set (customer info, type, bid type, priority, owner, probability, deal value, weighted revenue, business unit, region, industry, competitors, sales stage, timeline, next actions, attachments, version history, approval status).
2. **Account Management** — account profile, contacts, decision-maker mapping, stakeholder graph, health score, renewals, contract details, support history, AI health prediction, upsell/cross-sell signals.
3. **Bid Management** — bid tracking, bid calendar, submission timeline, compliance matrix, clarification tracker, version control, review checklist, approval workflow.
4. **Task Management** — Kanban (Not Started / In Progress / Waiting Customer / Waiting Internal / Completed / Blocked), recurring tasks, dependencies, AI-suggested priority, automatic escalation.
5. **Executive Dashboard** — real-time KPIs, weighted pipeline, revenue forecast, open/risk opportunities, proposal status, account health, win/loss rate, upcoming deadlines, executive insights.
6. **AI Layer** (Section 5) sits across all of the above, never as a separate silo.

---

## 4. OPPORTUNITY STATE MACHINE (build this as the system's spine)

Model every lifecycle stage from Section 2 as an explicit state with defined transitions, guard conditions, allowed roles per transition, and audit logging on every transition. Persist state history (who moved it, when, from/to, why) — this history feeds the AI Loss Analysis and Knowledge Base Learning modules directly. Do not model this as a free-text "stage" string; it must be an enforced state machine at the database and API layer.

---

## 5. AI CAPABILITIES (each is a distinct, swappable service — not a single chatbot)

| Capability | Behavior |
|---|---|
| **AI Copilot** | Present on every page via a docked side panel (never a floating avatar). Answers questions, shows high-risk deals, drafts proposals/opportunities, summarizes RFPs, generates executive summaries and follow-up emails, searches prior proposals. |
| **AI RFP Intelligence** | Ingests PDF/Word/Email/ZIP via OCR + Azure Document Intelligence (or equivalent). Extracts requirements, deliverables, deadlines, budget, mandatory/optional criteria, technical/commercial scope. Produces compliance matrix, risk report, gap analysis, executive summary. |
| **AI Proposal Generator** | Generates technical proposal, commercial proposal, slide deck, architecture diagram, solution design, implementation plan, timeline, bill of materials, statement of work, customer email, executive summary. Exports PDF/DOCX/PPTX. |
| **AI Meeting Intelligence** | Ingests audio/Teams/Zoom recordings. Transcribes (Whisper), summarizes, extracts action items, generates MOM, creates tasks with owners, updates the opportunity automatically. |
| **AI Email Intelligence** | Connects Outlook/Gmail. Detects new opportunities in threads, summarizes conversations, drafts replies, schedules follow-ups, updates CRM fields automatically (with a human-in-the-loop confirm step). |
| **AI Win Prediction** | ML model producing win probability, revenue forecast, deal health, customer intent, risk level, recommended next actions — each with an explanation, not just a score. |
| **AI Knowledge Assistant** | RAG over pgvector: previous proposals, RFPs, case studies, architectures, past emails, lessons learned, contracts. Every AI Copilot answer that cites prior work must show its source. |

**Non-negotiable AI product rule:** every AI output is labeled with a business term, never "AI Generated" — see Section 7's labeling table. Every AI action that changes a record (updating CRM, creating a task, moving a stage) requires an explicit user confirmation step; nothing writes silently.

---

## 6. TECH STACK & ARCHITECTURE

**Frontend:** Next.js (App Router) + React + TypeScript + TailwindCSS + ShadCN UI.

**Backend platform — Supabase is the system of record:**
- Database: PostgreSQL via Supabase, UUID primary keys, triggers, stored procedures, full-text search, `pgvector` for semantic search, automated backups, audit logging tables on every core entity.
- Auth: Supabase Auth — Email/Password, Magic Link, OAuth (Microsoft, Google). Layer Azure AD SSO on top where the customer requires it.
- Authorization: Row Level Security (RLS) as the primary enforcement layer, with an application-level RBAC model mapped onto RLS policies — every table's RLS policy must be written before its API route.
- Storage: Supabase Storage buckets for proposals, RFPs, attachments, audio recordings, images, contracts — bucket-level policies mirroring RLS.
- Realtime: Supabase Realtime for live opportunity updates, live Kanban, live notifications, presence indicators.
- Compute: Supabase Edge Functions for AI orchestration, workflow automation, background jobs, document processing.
- Where orchestration complexity exceeds what an Edge Function should own (long-running multi-step AI pipelines, heavy document processing), stand up a dedicated Node.js/NestJS service that talks to Supabase via service-role keys — do not put this logic in the frontend.

**AI providers:** Azure OpenAI / OpenAI GPT-5-class models for generation and reasoning, Whisper for transcription, Azure Document Intelligence (or equivalent OCR) for document extraction, Claude and Gemini as interchangeable providers behind a single internal AI-gateway interface so the model backing any feature can be swapped without touching product code.

**Vector store:** `pgvector` inside Supabase Postgres (do not stand up a separate Qdrant instance unless retrieval-latency testing in Phase 6 proves pgvector insufficient at target scale — justify the decision in writing if you deviate).

**APIs:** REST for CRUD, GraphQL for dashboard/reporting aggregation queries, WebSockets/Supabase Realtime for live state.

**Delivery:** Docker, Kubernetes manifests, Terraform for infra-as-code, GitHub Actions CI/CD, structured logging + telemetry (OpenTelemetry), unit + integration + E2E test suites (Vitest/Jest + Playwright).

---

## 7. UI/UX SYSTEM — TREAT AS HARD CONSTRAINTS, NOT SUGGESTIONS

**Absolutely forbidden, in any screen, at any point:** robot illustrations or avatars, AI-assistant mascots, robot emojis, sparkle icons, brain icons, magic-wand icons, neon/futuristic styling, ChatGPT-style chat bubbles/branding, gradient-heavy surfaces, cartoon elements, generic "AI-themed" stock graphics. If a generated screen contains any of these, it fails review and must be redone.

**Design language:** flat, minimal, premium enterprise — the reference set is Microsoft Dynamics 365, Microsoft Fabric, Azure Portal, SAP Fiori, Oracle Fusion Cloud, Salesforce Lightning, Notion Enterprise, Linear, Jira, Monday Enterprise. Large white space, soft shadows, 10–12px corner radius, glass effects only where they carry real meaning (e.g., a modal scrim), subtle fast micro-interactions only.

**Color tokens:**
| Token | Hex |
|---|---|
| Primary | `#1E2761` |
| Secondary | `#2563EB` |
| Background | `#F8F9FB` |
| Card | `#FFFFFF` |
| Border | `#E5E7EB` |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Danger | `#DC2626` |

**AI labeling table — use the left column in every screen; the right column never appears in UI copy:**

| Use this | Never this |
|---|---|
| Suggested Summary | AI Generated |
| Recommended Action | AI Suggests |
| Business Insight | AI Insight |
| Next Best Action | AI Recommendation |
| Opportunity Insight | — |
| Proposal Recommendation | — |
| Risk Assessment | — |
| Executive Insight | — |

**Iconography:** Lucide outline icons only, chosen for business meaning — Document, Checklist, Briefcase, Analytics, Light Bulb, Chart, Timeline, Shield, Handshake, People, Calendar, Folder, File. No icon should visually signal "this is AI."

**Layout:** left navigation, sticky top command bar with global search, notification center, workspace switcher, quick actions, breadcrumb navigation, collapsible sidebar, context-aware right panel, responsive/resizable grid.

**Tables:** enterprise data grid with column sort/pin, advanced filters, grouping, bulk actions, CSV/Excel export, infinite scroll, inline editing, saved views.

**Forms:** multi-step, autosave, inline validation, progress indicator, contextual help, smart defaults, AI autofill (labeled per the table above).

**Interaction:** Command Palette (Ctrl/Cmd+K), universal search, keyboard shortcuts, context menus — minimize clicks and typing everywhere.

**Accessibility:** WCAG AA, full keyboard navigation, screen-reader support, high-contrast mode, dark mode, responsive across breakpoints.

---

## 8. SECURITY

Azure AD SSO (layered over Supabase Auth), MFA, RBAC enforced via Supabase RLS, full audit logs on every write to a core entity, encryption at rest and in transit, secure file storage with per-bucket policy, API security (rate limiting, input validation, signed URLs for file access), OWASP Top-10 compliance checklist as a release gate.

---

## 9. EXECUTION PLAN — BUILD IN THIS ORDER, DO NOT PARALLELIZE PHASES

1. **Foundation** — repo scaffold (monorepo: `apps/web`, `apps/edge-functions` or `apps/api`, `packages/ui`, `packages/db`), Supabase project schema, RLS policies, auth flows, CI/CD skeleton.
2. **Opportunity Core** — the state machine (Section 4), Opportunity CRUD + full field set, audit/version history.
3. **Account, Bid, Task modules** — full CRUD + Kanban + compliance matrix + bid calendar.
4. **Executive Dashboard** — KPIs, pipeline analytics, drill-downs, wired to real data from steps 2–3 (no mock numbers).
5. **AI Gateway** — single internal interface abstracting Azure OpenAI/GPT/Claude/Gemini/Whisper, with per-feature prompt templates and response contracts (structured JSON, validated with schemas — no free-text parsing in application code).
6. **AI RFP Intelligence + Knowledge Assistant (RAG)** — ingestion pipeline, OCR, extraction, pgvector store, compliance/risk/gap outputs.
7. **AI Proposal Generator + Meeting Intelligence + Email Intelligence** — document generation exports, transcription pipeline, inbox connectors.
8. **AI Win Prediction** — model + explanation layer, wired into the dashboard and opportunity detail view.
9. **Workflow Automation** — task creation, escalation, SLA detection, weekly report generation.
10. **Hardening** — security checklist, load testing, accessibility audit, full test suite (unit/integration/E2E), Terraform + Kubernetes deploy, admin/developer/user guides.

At the end of every phase, the agent must produce: the code, the migration/schema diff, updated API docs (Swagger/OpenAPI), and a short changelog. Do not proceed to the next phase until the current phase's tests pass.

---

## 10. DELIVERABLES CHECKLIST

- [ ] Complete monorepo folder structure
- [ ] Full database schema + ER diagram
- [ ] System architecture diagram (high-level + low-level design)
- [ ] OpenAPI/Swagger documentation
- [ ] All UI screens as responsive, reusable components
- [ ] Production-ready code (no stubs, no mocked AI responses)
- [ ] Dockerfiles, Kubernetes manifests, Terraform modules, GitHub Actions workflows
- [ ] Unit, integration, and E2E test suites
- [ ] Security checklist (OWASP-mapped)
- [ ] Admin guide, developer guide, user guide

---

## 11. DEFINITION OF DONE

A module is "done" only when: it is wired to real Supabase data (not fixtures), its RLS policy is written and tested, its UI matches Section 7 exactly with zero forbidden elements, its AI-touching actions require explicit confirmation before writing, and it has passing automated tests. If any of these is missing, the module is incomplete — say so explicitly rather than marking it done.

---

## 12. AUTOMATED SUPABASE PROVISIONING (RUN THIS FIRST, BEFORE PHASE 1)

Supabase project credentials (URL, `anon` key, `service_role` key, and DB connection string) will be supplied directly to the agent. The agent must attempt **fully automatic provisioning** — no manual dashboard clicking, no asking the user to run anything by hand, unless automation genuinely fails.

**Automatic path (attempt first, in this order):**

1. Use the `service_role` key + DB connection string to connect directly (via `psql`, the Supabase CLI, or a Postgres client library) and run migrations programmatically.
2. Initialize a `supabase/migrations/` folder in the repo. Every schema change is a versioned migration file, never a manual dashboard edit — this keeps the DB reproducible and matches Section 9's "migration diff at end of every phase" rule.
3. Apply migrations with `supabase db push` (if the Supabase CLI is linked to the project) or by executing the migration SQL directly against the connection string.
4. Auto-provision in the same automated pass: extensions (`uuid-ossp`, `pgvector`), all core tables, RLS policies, storage buckets (proposals, rfps, attachments, audio, images, contracts) with matching bucket policies, and auth provider config (Email/Password, Magic Link, OAuth).
5. Verify by querying `information_schema` / `pg_policies` after applying, and report back a concrete pass/fail per table — not just "done."

**Fallback path (only if automatic provisioning fails — e.g., network/permission/CLI issues):**

- Do not stall or ask the user to debug Supabase infrastructure. Instead, output a single, complete, idempotent SQL script (`CREATE TABLE IF NOT EXISTS`, `CREATE POLICY` guarded with existence checks) that the user can paste directly into the Supabase SQL Editor and run in one shot.
- The fallback script must be self-contained: extensions, tables, indexes, RLS enablement + policies, triggers, and storage bucket creation (via `storage.buckets` inserts) all in one file, in dependency order, with no external references.
- A starting version of this fallback script — covering the core entities from Section 3/4 — is provided below as `presales-command-center-schema.sql`. Treat it as the seed; extend it (never replace its structure) as later phases add tables (RFP intelligence, proposals, AI predictions, meeting transcripts, knowledge base embeddings).

**Rule for both paths:** whichever path is used, the resulting schema must be committed to the repo as versioned migration files before Phase 2 begins. Auto-provisioning is a convenience, not a replacement for reproducible, source-controlled schema.

## 13. Supabase Cred
- DB URL: https://supabase.com/dashboard/project/iovjpynbhxuhmrpotmkb/settings/general
- Project ref: iovjpynbhxuhmrpotmkb
- anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdmpweW5iaHh1aG1ycG90bWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzU4MjksImV4cCI6MjEwMTA1MTgyOX0.1NSbqrLZXhl4KfkMMXOxXDLaFcPnlYjSSNqXHEzC3O8
- service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdmpweW5iaHh1aG1ycG90bWtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ3NTgyOSwiZXhwIjoyMTAxMDUxODI5fQ.ywc5SWK86C_hMXF0Q6ChLCPFqeialgnYSpbXwwpJFAY