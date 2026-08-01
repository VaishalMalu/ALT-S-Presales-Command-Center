# Security & Hardening Checklist (OWASP-Mapped)

## 1. Authentication & Authorization (OWASP A01:2021)

- [x] Azure AD SSO layered over Supabase Auth for Enterprise Identity Provider consistency.
- [x] Multi-Factor Authentication (MFA) required for all sales and executive roles.
- [x] Row Level Security (RLS) enabled on all core tables (`accounts`, `opportunities`, `bids`, `tasks`, `knowledge_base`).
- [x] Role-Based Access Control (RBAC) enforced via application-level logic backed by JWT claims mapped into Postgres policies.

## 2. Data Protection (OWASP A02:2021)

- [x] Encryption in transit (TLS 1.2+ mandatory for all API routes).
- [x] Encryption at rest handled by Supabase Postgres.
- [x] Secure file storage implemented via Supabase Storage Buckets (`proposals`, `rfps`, etc.) with strict bucket-level policies.

## 3. Injection Prevention (OWASP A03:2021)

- [x] Use of parameterized queries implicitly via PostgREST/Supabase client. No string-concatenated SQL queries in Node.js.
- [x] Strict Zod validation on AI Gateway JSON outputs to prevent AI-driven prompt injection / poison data escaping into application state.

## 4. Security Logging and Monitoring (OWASP A09:2021)

- [x] Dedicated `opportunity_state_history` table logging every state transition, timestamp, and user UUID.
- [x] Supabase native audit logging enabled.

## 5. API Security

- [ ] Rate limiting on Next.js API routes (Pending infrastructure level config in Azure/Vercel).
- [x] Signed URLs utilized for accessing sensitive attachments and proposals.
