

# NDG Hub v2 — Phase 1 Implementation Plan

## Overview
Build NDG Hub v2, an internal work management platform for Neurodiversity Global. 26 database tables, full design system, auth with 3 roles, 7 core page areas, 14+ Edge Functions, AI integration, and client portal. Following the 17-step sequence from PLAN.md.

---

## Step 1.1 — Database Foundation
Create all 26 tables (organisations, contacts, profiles, services, projects, deliveries, sessions, session_agenda_items, tasks, daily_states, forms, form_responses, contracts, invoices, invoice_items, meetings, project_updates, notes, emails, documents, notifications, activity_log, client_portal_access, curriculum_workshops, knowledge_articles, partners, ai_generations, ai_conversations). Enable RLS on every table. Create policies for admin/team/client roles using a `has_role` security definer function. Create profiles trigger on auth.users insert.

## Step 1.2 — Design System Setup
Configure `index.css` with all NDG colour tokens (light + dark via `data-theme`). 5 accent themes via `data-accent`. Configure `tailwind.config.ts` to extend from CSS vars. Load Satoshi, General Sans, JetBrains Mono fonts. Create type scale utility classes. Create `getStatusColor()` utility. Implement theme toggle + accent picker with localStorage. Build AppShell layout: 260px sidebar with nav groups, sticky header, mobile hamburger nav.

## Step 1.3 — Auth + Route Guards
Supabase Auth with email/password. Login page. Role-based routing (admin/team → full app, client → /portal). Profiles row auto-creation on signup. Route guard component checking `profiles.role`.

## Step 1.4 — Services Catalogue
Services page (`/services`). CRUD table for services with name, category, price, duration, neuro_phase, active toggle. Seed 4 workshops + 4 services.

## Step 1.5 — Organisations & Contacts
Clients page (`/clients`). Organisation list with search. Client Detail (`/clients/:id`) with Profile + Contacts tabs. CRUD for both. Primary contact badge. Seed 3 orgs.

## Step 1.6 — Projects + scaffold-project Edge Function
Projects page with Board/List/Table views. `scaffold-project` Edge Function (creates project + deliveries + sessions + forms in one transaction). Project Detail with 8 tabs (Overview, Workshops, Tasks, Billing, Forms, Notes, Documents, Updates — some stub initially). `advance-project-status` Edge Function with transition validation.

## Step 1.7 — Workshops (Deliveries) + Sessions + Agenda Builder
Workshops page with Board/List/Table/Calendar views. Workshop Detail with Overview, Sessions, Feedback, Documents tabs. Agenda Builder with drag-to-reorder, type badges, running time total. `advance-delivery-status` Edge Function.

## Step 1.8 — Tasks
Tasks page with Board/List/Table/Timeline/Calendar views. Task CRUD with subtask hierarchy. Tasks tab on Project Detail.

## Step 1.9 — Forms + Form Builder + Public Form
Forms page. JSON-driven Form Builder with drag-to-reorder fields, preview tab. Public form route (`/form/:formId`, no auth). `process-form-response` Edge Function (saves response, calculates satisfaction_score).

## Step 1.10 — Invoices
Invoices page with KPI cards. `generate-invoice` Edge Function (auto-number, service prices, VAT calc). Invoice detail view. `send-invoice`, `mark-invoice-paid`, `recalculate-invoice` Edge Functions.

## Step 1.11 — Daily Brief + Insights
Daily Brief page with `dailyBrief` Edge Function. KPI cards, today's schedule, focus tasks, red flags. Insights page with Business + Personal tabs. `insightsBusiness` + `insightsPersonal` Edge Functions. Charts via recharts.

## Step 1.12 — Home Dashboard
Home page with KPI cards, greeting, quick action pills, overdue alerts, energy card, needs attention list, workshops this week, revenue/satisfaction charts.

## Step 1.13 — AI Foundation
`useAI` hook (streaming SSE, context injection, rate limiting). `useAIContext` hook. AI Assistant page (`/ai`) with 4 agent modes. `ai-assistant` Edge Function (Claude Sonnet). `ai-extract` Edge Function (Claude Haiku). "Create from Plan" on Projects page. Will need Claude API key as a secret.

## Step 1.14 — AI Session Planner + Feedback Summariser
`ai-session-planner` Edge Function. "Plan Session" button on Workshop Detail. `ai-impact-reporter` Edge Function. "Summarise Feedback" button on Forms.

## Step 1.15 — Client Portal
Portal page (`/portal`). Client-scoped views via RLS. Magic link auth. "Invite to Portal" flow from Client Detail contacts.

## Step 1.16 — Scheduled Jobs + Final Polish
pg_cron jobs (invoice overdue, task overdue, delivery reminder, AI cache cleanup). Verify all empty states, skeleton loaders, status badges, mobile responsiveness.

## Step 1.17 — Seed Data + End-to-End Test
Seed SQL with 3 orgs, 6 projects, 18 deliveries, forms, invoices, services. Full lifecycle verification.

---

## Key Rules Followed Throughout
- No business logic in React — Edge Functions for multi-table ops
- UI: "Workshops"/"Clients" — DB: `deliveries`/`organisations`
- All colours via CSS custom properties, never raw hex
- shadcn/ui components customised with NDG tokens
- Every list page has an empty state
- Files under 300 lines, split if larger
- RLS on every table, 3 roles only

## Note
This is a large build. Due to response limits, implementation will proceed step by step. I'll report which step was completed and which is next after each message.

