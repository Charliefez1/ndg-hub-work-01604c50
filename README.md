# NDG Hub

Internal operations platform for a neurodiversity-focused learning & development consultancy. Manages the full lifecycle of client engagements — from contracting through delivery to impact evaluation — with AI-powered productivity tools and a self-service client portal.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite 8
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives)
- **State:** TanStack React Query
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- **AI:** Claude API with Lovable Gateway fallback

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build

# Lint
bun run lint
```

## Environment Variables

Copy `.env.example` to `.env` and set:

```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

## Project Structure

```
src/
  components/     # UI components (auth, layout, projects, services, ui)
  hooks/          # Data hooks (one per entity: useProjects, useTasks, etc.)
  integrations/   # Supabase client & generated types
  lib/            # Utilities (theme, status-colors)
  pages/          # Route pages (Index, Projects, Tasks, etc.)
  test/           # Unit tests
supabase/
  functions/      # Edge functions (15 serverless functions)
  migrations/     # Database schema & seed data
docs/             # Product, tech, and feature specifications
```

## Documentation

- [Product Spec](docs/PRODUCT_SPEC.md) — User journeys, data model, status pipelines
- [Tech Spec](docs/TECH_SPEC.md) — Architecture, database schema, conventions
- [Feature Spec](docs/FEATURE_SPEC.md) — Detailed feature descriptions per page
- [Audit Report](docs/AUDIT_REPORT.md) — Platform audit with improvement recommendations
