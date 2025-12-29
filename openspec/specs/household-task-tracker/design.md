# Design: Household Task Tracker

## Overview
The Household Task Tracker is a Next.js (App Router) web application for collaborative task management within a household workspace.

## Architecture
- **Frontend**: Next.js App Router with React Server Components; Client Components only for interactive UI.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Better Auth (email/password).
- **UI**: shadcn/ui components with Tailwind.
- **Validation**: Zod schemas (shared for server actions and client forms).

## Key Domain Models
- **Household**: Shared workspace.
- **User**: Authenticated user associated with a household.
- **Task**: Title/description, status, priority, due date, completion timestamp, optional assignee/category, and dependency.
- **Category**: Household-shared label.
- **Dependency**: A blocking relationship between tasks.

## Data / Integrity Rules
- All task and category operations are household-scoped.
- Assignment is restricted to users in the same household.
- A blocked task cannot be marked done until the blocking task is complete.
- Circular dependencies are rejected.
- Completing a task records a completion timestamp.

## Implementation Notes (non-normative)
- Prefer server-side enforcement for scoping and invariants.
- Surface validation errors to the UI without persisting invalid data.
- Notifications are in-app and should target the assigned user only.
