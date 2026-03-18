# NDG Hub — Platform Audit Report

> Audited: 2026-03-18 | Scope: Full-stack review (frontend, backend, database, security, testing, CI/CD)

---

## Executive Summary

NDG Hub is a well-architected internal operations platform built with React + Vite + Supabase. The codebase demonstrates strong fundamentals: typed throughout, consistent hook patterns, proper RLS on all tables, and clean separation of concerns. However, the audit identified **31 findings** across security, reliability, testing, performance, and feature completeness.

### Severity Breakdown
| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 3 | Security issues that should be fixed immediately |
| **High** | 7 | Reliability/data integrity issues |
| **Medium** | 11 | Code quality and maintainability improvements |
| **Low** | 10 | Nice-to-haves and polish |

---

## 1. CRITICAL — Security Issues

### 1.1 `.env` file committed to version control
**File:** `.env`
**Issue:** The `.env` file containing `VITE_SUPABASE_PUBLISHABLE_KEY` and project credentials is committed to the repository. While these are anon/publishable keys (not secret), committing `.env` sets a dangerous precedent and `.env` files should always be gitignored.
**Fix:** Add `.env` to `.gitignore` (partially done — `.env` is listed but the file exists in the repo). The file needs to be removed from git tracking while keeping it locally.

### 1.2 Open sign-up with auto-confirm allows privilege escalation path
**File:** `src/hooks/useAuth.tsx`, `supabase/migrations/*`
**Issue:** Anyone can sign up via the `/login` page. New users are auto-assigned the `team` role with full read/write access to all operational data (projects, tasks, invoices, clients). There is no invite-only mechanism or admin approval workflow.
**Risk:** An attacker could sign up, get `team` access, and view/modify all business data.
**Recommendation:** Add invite-only registration or admin approval flow. At minimum, new users should get a `pending` role with no data access until an admin promotes them.

### 1.3 Public form responses have no rate limiting or validation
**File:** `supabase/migrations/*` (RLS policy `public_insert_responses`)
**Issue:** The `form_responses` table allows `INSERT WITH CHECK (true)` — anyone can insert unlimited responses without authentication. No CAPTCHA, rate limiting, or input size validation.
**Risk:** Spam flooding, storage abuse, data pollution.
**Recommendation:** Add rate limiting via Supabase edge function, add a honeypot field, or require a form-specific token.

---

## 2. HIGH — Reliability & Data Integrity

### 2.1 No test coverage (only placeholder test)
**File:** `src/test/example.test.ts`
**Issue:** The entire test suite is a single `expect(true).toBe(true)`. Zero tests for hooks, components, edge functions, or business logic.
**Impact:** No regression protection. Any change could break critical flows (invoicing, project scaffolding, auth).
**Recommendation:** Priority test targets:
- Auth flow (sign-in, sign-up, role checking, route guards)
- Invoice generation (calculation accuracy, VAT, edge cases)
- Task CRUD operations
- Project scaffolding
- Status pipeline transitions
- Public form submission

### 2.2 Edge functions use `any` type assertions extensively
**Files:** All edge functions
**Issue:** Response data is cast with `(d as any).services?.price`, `(project as any).organisations?.name` throughout. This masks potential runtime errors.
**Recommendation:** Define proper TypeScript interfaces for all Supabase query responses.

### 2.3 No error boundaries in the React app
**File:** `src/App.tsx`
**Issue:** No React Error Boundary components. An unhandled error in any component will crash the entire app with a white screen.
**Recommendation:** Add a top-level `<ErrorBoundary>` with a user-friendly fallback UI.

### 2.4 QueryClient has no default error handling
**File:** `src/App.tsx:39`
**Issue:** `new QueryClient()` is created with zero configuration — no default `onError`, no `retry` config, no `staleTime`. Every failed query silently fails unless individually handled.
**Recommendation:** Configure sensible defaults:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
    mutations: {
      onError: (error) => toast.error(error.message),
    },
  },
});
```

### 2.5 Notification preferences not persisted
**File:** `src/pages/Settings.tsx:179`
**Issue:** The notification preferences (in-app, Telegram toggles) use `<Switch defaultChecked />` with no state management and no database persistence. Changes are lost on page refresh.
**Recommendation:** Add a `notification_preferences` JSONB column to `profiles` or create a dedicated table.

### 2.6 Dashboard KPI grid not responsive on mobile
**File:** `src/pages/Index.tsx:52`
**Issue:** `grid grid-cols-4` has no responsive breakpoints. On mobile, 4 columns will be extremely cramped.
**Fix:** Change to `grid grid-cols-2 md:grid-cols-4`.

### 2.7 Missing `ON DELETE CASCADE` for several foreign keys
**File:** `supabase/migrations/*`
**Issue:** `projects.organisation_id` has no `ON DELETE CASCADE`, meaning deleting an organisation will fail if it has projects. Same for `invoices.project_id`, `deliveries.feedback_form_id`, etc.
**Recommendation:** Review all FK constraints and add appropriate cascade/restrict policies based on business rules.

---

## 3. MEDIUM — Code Quality & Maintainability

### 3.1 Duplicate toast providers
**File:** `src/App.tsx:51-52`
**Issue:** Both `<Toaster />` (from shadcn/ui) and `<Sonner />` are rendered. The app uses both `toast()` from sonner and `useToast()` from shadcn. Pick one.
**Recommendation:** Standardize on Sonner (already used in most components). Remove the shadcn Toaster.

### 3.2 `profiles.role` column duplicates `user_roles` table
**File:** `supabase/migrations/*`
**Issue:** The `profiles` table has a `role` column, AND there's a separate `user_roles` table. The tech spec explicitly states "Role storage: user_roles table (not on profiles — prevents privilege escalation)". The `profiles.role` column contradicts this design.
**Risk:** Role data can go out of sync between the two sources.
**Recommendation:** Remove `profiles.role` column or make it a computed/view column. Use `user_roles` as the single source of truth.

### 3.3 Inconsistent status display (`replace('_', ' ')` everywhere)
**Files:** Multiple pages (Tasks.tsx, Index.tsx, Portal.tsx, etc.)
**Issue:** Status formatting is done inline with `.replace('_', ' ')` in dozens of places. There's already a `formatStatus()` function in `status-colors.ts` that does this properly, but it's not used.
**Recommendation:** Replace all inline status formatting with `formatStatus()`.

### 3.4 No loading/error states in Portal page
**File:** `src/pages/Portal.tsx`
**Issue:** The portal page doesn't handle loading or error states for its queries. Clients see nothing while data loads.
**Recommendation:** Add skeleton loaders (already used in Tasks page) and error handling.

### 3.5 Command palette doesn't search entities
**File:** `src/components/layout/CommandPalette.tsx`
**Issue:** The spec says "Search across projects, clients, tasks" but the palette only searches page names.
**Recommendation:** Add entity search (projects, clients, tasks) to the command palette for a truly useful keyboard-first experience.

### 3.6 Services `category` CHECK constraint is too narrow
**File:** `supabase/migrations/*:99`
**Issue:** `category IN ('workshop', 'service')` but the business offers coaching, keynotes, consultancy, assessments — these are all forced into 'service'. The PRODUCT_SPEC mentions broader categories.
**Recommendation:** Expand the CHECK constraint or remove it in favour of a reference table.

### 3.7 Missing `updated_at` trigger on several tables
**File:** `supabase/migrations/*`
**Issue:** Tables `contacts`, `meetings`, `partners`, `session_agenda_items`, `invoice_items`, `form_responses` have no `updated_at` column or trigger.
**Recommendation:** Add `updated_at` columns and triggers for consistency and audit trail accuracy.

### 3.8 AI model reference outdated
**File:** `supabase/functions/ai-assistant/index.ts:32`
**Issue:** Uses `claude-sonnet-4-5-20250514`. The latest models are Claude 4.5/4.6 family.
**Recommendation:** Update to `claude-sonnet-4-6` for improved performance.

### 3.9 `insights-personal` focus scale mismatch
**File:** `supabase/functions/insights-personal/index.ts:122`
**Issue:** The optimal window message says "avg focus: X/10" but `daily_states.focus_level` is constrained to 1-5, not 1-10.
**Fix:** Change to "/5".

### 3.10 Unused `Plus` import in Home page
**File:** `src/pages/Index.tsx:11`
**Issue:** `Plus` is imported from lucide-react but never used.
**Fix:** Remove unused import.

### 3.11 Board view has no drag-and-drop
**File:** `src/pages/Tasks.tsx:79-108`
**Issue:** The Kanban board view renders columns but has no drag-and-drop capability. Users can only change status via dropdown menus. For an ADHD-informed design, the tactile satisfaction of dragging cards is a significant UX gap.
**Recommendation:** Consider adding `@dnd-kit/core` for drag-and-drop task management.

---

## 4. LOW — Polish & Enhancement Opportunities

### 4.1 No password reset flow
**File:** `src/pages/Login.tsx`
**Issue:** No "Forgot password?" link or password reset functionality.
**Recommendation:** Add Supabase `resetPasswordForEmail()` flow.

### 4.2 No data export capability
**Issue:** No CSV/PDF export for invoices, tasks, or project reports.
**Recommendation:** Add export buttons on list pages.

### 4.3 `README.md` is empty
**File:** `README.md`
**Issue:** Just says "TODO: Document your project here".
**Recommendation:** Add setup instructions, architecture overview, and deployment guide.

### 4.4 Bundle size check is a warning, not a failure
**File:** `.github/workflows/ci.yml:28`
**Issue:** The bundle size check just prints a warning but doesn't fail the build.
**Recommendation:** Add `exit 1` to enforce the bundle size limit.

### 4.5 No Playwright E2E tests configured
**File:** `playwright.config.ts`, `playwright-fixture.ts`
**Issue:** Playwright is installed but no actual E2E tests exist.
**Recommendation:** Add critical path E2E tests (login, create project, create invoice).

### 4.6 Storage bucket is fully public
**File:** `supabase/migrations/*:225242`
**Issue:** The `documents` bucket is public with an anon read policy. All uploaded documents are world-readable.
**Risk:** Sensitive client documents (contracts, proposals) are publicly accessible via URL.
**Recommendation:** Make the bucket private and use signed URLs for document access.

### 4.7 No pagination on list pages
**Files:** All list pages
**Issue:** All queries fetch all records with no pagination. At scale (1000+ tasks/invoices), this will cause performance issues.
**Recommendation:** Add cursor-based pagination for large datasets.

### 4.8 Missing meta tags and SEO
**File:** `index.html`
**Issue:** While this is an internal app, proper meta tags, favicon, and OpenGraph tags improve link sharing and bookmarking.

### 4.9 No offline indicator
**Issue:** No visual indicator when the user loses network connectivity. Failed queries silently fail.
**Recommendation:** Add a network status indicator in the AppShell.

### 4.10 Notification bell doesn't use real-time subscriptions
**File:** `src/components/notifications/NotificationBell.tsx`
**Issue:** Notifications are fetched via polling (React Query), not Supabase Realtime. Users need to refresh to see new notifications.
**Recommendation:** Add Supabase Realtime subscription for instant notification delivery.

---

## 5. Architecture Strengths (What's Working Well)

1. **Consistent hook pattern**: One file per entity with `useX`, `useCreateX`, `useUpdateX`, `useDeleteX` — easy to maintain.
2. **Comprehensive RLS**: Every table has row-level security with proper role-based policies.
3. **Centralized status colours**: `status-colors.ts` prevents inconsistent styling.
4. **NEURO framework integration**: Deeply embedded in the data model (phases, Kirkpatrick levels).
5. **Activity logging**: Database triggers automatically log CRUD operations.
6. **AI multi-model fallback**: Edge functions gracefully fall back from Claude to Gemini.
7. **Clean separation**: Edge functions handle all business logic, frontend is purely presentational.
8. **pg_cron scheduled jobs**: Automated overdue checks and cleanup are production-ready.
9. **Design system**: Custom typography, accent colours, dark mode — all properly tokenized.
10. **Command palette**: Keyboard-first navigation with `Cmd+K`.

---

## 6. Recommended Priority Actions

### Immediate (This Sprint)
1. Fix responsive grid on dashboard (`grid-cols-2 md:grid-cols-4`)
2. Add React Error Boundary
3. Configure QueryClient defaults (staleTime, retry, error handling)
4. Fix focus scale display (`/5` not `/10`)
5. Update AI model to `claude-sonnet-4-6`
6. Remove duplicate toast provider
7. Add password reset flow to login page

### Short-Term (Next 2 Sprints)
8. Add unit tests for critical business logic (invoice calc, auth, status pipelines)
9. Implement invite-only registration or admin approval
10. Add rate limiting to public form responses
11. Persist notification preferences
12. Make documents bucket private
13. Add loading states to Portal page

### Medium-Term (Next Quarter)
14. Add E2E tests with Playwright
15. Implement entity search in command palette
16. Add drag-and-drop to task board
17. Add CSV/PDF export for invoices and reports
18. Add real-time notifications via Supabase Realtime
19. Add pagination to list pages
20. Remove `profiles.role` column (use `user_roles` exclusively)

---

*Generated by platform audit — session 2026-03-18*
