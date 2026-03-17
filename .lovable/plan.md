

## Audit: What's Built vs What's in the Database

The database has **29 tables** but only ~15 have corresponding UI. Here's the gap analysis:

### Tables with NO UI coverage

| Table | What it's for | Priority |
|-------|--------------|----------|
| `contracts` | Client contracts with terms, dates, values | High |
| `meetings` | Meeting scheduling with attendees, notes | High |
| `notes` | Freeform notes attached to entities | Medium |
| `notifications` | In-app notification system | Medium |
| `documents` | File/document management per entity | Medium |
| `emails` | Email tracking/logging | Medium |
| `partners` | Partner/referral tracking with commission | Low |
| `knowledge_articles` | Internal knowledge base | Low |
| `curriculum_workshops` | Template/default workshop agendas | Low |
| `daily_states` | Daily mood/energy tracking | Low |
| `project_updates` | Status update posts on projects | Medium |

### Missing Pages / Features

1. **Settings page** — referenced in the sidebar nav but no `/settings` route or page exists
2. **Notifications bell** — `notifications` table exists but no UI to display them
3. **Notes panel** — no way to add/view notes on projects, clients, or deliveries
4. **Documents/file uploads** — `documents` table exists but no storage integration
5. **Contracts management** — table has fields for contract type, value, dates, renewal tracking
6. **Meetings page** — scheduling, attendees, location, notes
7. **Project updates** — timeline/feed of status updates within ProjectDetail
8. **Active Projects KPI bug** — Home page filters for `in_progress` but seed data uses `project_planning` etc.

---

## Plan: Complete Remaining Features

### Step 1 — Fix Active Projects KPI
Update `Index.tsx` to count projects with any active status (`project_planning`, `delivery`, `feedback_analytics`) instead of just `in_progress`.

### Step 2 — Settings Page
Create `/settings` page with sections for profile editing (display name, avatar) and app preferences (theme toggle).

### Step 3 — Notifications System
- Create a `useNotifications` hook
- Add a notification bell icon in the AppShell header with a dropdown showing recent notifications
- Mark-as-read functionality

### Step 4 — Notes Panel
- Create a reusable `NotesPanel` component
- Add it as a tab in `ProjectDetail`, `ClientDetail`, and `WorkshopDetail`
- CRUD via a `useNotes` hook

### Step 5 — Contracts Management
- Create `/contracts` route (or add as a tab on ClientDetail)
- `useContracts` hook for CRUD
- Display contract value, dates, status, renewal info

### Step 6 — Meetings Page
- Create `/meetings` route or integrate into ClientDetail/ProjectDetail
- `useMeetings` hook
- List view with date, attendees, location, and notes

### Step 7 — Project Updates Feed
- Add an "Updates" tab in `ProjectDetail`
- `useProjectUpdates` hook
- Allow posting status updates with optional AI-generated summaries

### Step 8 — Documents & File Storage
- Create a `useDocuments` hook
- Add document upload/list panel to entity detail pages
- Integrate with backend file storage

### Step 9 — Partners & Knowledge Base (Lower Priority)
- Partners page for referral tracking
- Knowledge articles page for internal documentation

This covers all unused database tables and fills the feature gaps. Implementation would be roughly 9 steps.

