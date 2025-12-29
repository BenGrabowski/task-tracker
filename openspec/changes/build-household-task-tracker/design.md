## Context
This change proposal defines the target design for the Household Task Tracker and documents the technical constraints and invariants that the implementation MUST follow.

## Technical Requirements

### Runtime / Framework
- The application MUST be implemented with Next.js App Router and TypeScript.
- The application MUST prefer React Server Components; Client Components MUST be used only where interactivity is required.
- The application MUST use Server Actions as the primary application boundary for mutations and household-scoped reads.
- The application MUST NOT introduce REST/GraphQL APIs for core app flows unless explicitly approved in a separate change.

### Data / Persistence
- The application MUST use PostgreSQL with Drizzle ORM.
- The application MUST ensure all task and category operations are household-scoped.
- The database schema MUST support:
  - Households
  - Users with `householdId` association
  - Categories that are household-scoped
  - Tasks that are household-scoped with:
    - `status` in {`todo`, `in_progress`, `done`}
    - `priority` in {`low`, `medium`, `high`}
    - optional `dueDate`
    - optional `completedAt`
    - optional `assigneeId`
    - optional `categoryId`
    - optional `blockedByTaskId` (single blocking dependency)

### Authentication / Authorization
- The application MUST use Better Auth with email/password authentication.
- Auth/session checks MUST occur server-side for every household-scoped operation.
- Authorization MUST enforce:
  - a signed-in user can access ONLY their household’s data
  - task assignment can target ONLY users in the same household
  - household membership grants equal permissions within the household (no role hierarchy unless added later)

### Validation
- All user input MUST be validated with Zod (server-side); client-side validation MAY reuse the same schemas.
- Forms SHOULD use React Hook Form integrated with Zod.
- Validation failures MUST prevent writes to the database.

### Correctness Invariants (Must-Hold)
The implementation MUST uphold these invariants (mirroring the Kiro “correctness properties”):
- Task creation persistence: created tasks must be retrievable with all provided fields.
- Task update preservation: updating a completed task must preserve `completedAt` unless explicitly clearing is supported.
- Task deletion cleanup: deleting a task must remove/clear dependency references pointing to it.
- Completion timestamp recording: marking done must set `completedAt`.
- Status transition validation: only valid transitions are allowed; backward transitions SHOULD be supported (e.g. `done -> in_progress -> todo`) if desired by product.
- Household assignment restriction: assignee must be in the same household; unassigned tasks remain valid.
- Category scoping: categories are shared within a household and isolated across households.
- Single category association: a task can have at most one category at a time.
- Dependency enforcement: blocked tasks cannot be marked done until the blocker is complete.
- Circular dependency prevention: any dependency update that would create a cycle must be rejected.
- Today view filtering: “today” view includes tasks due today or overdue (`dueDate <= now`, date semantics defined by app timezone).
- Search/filter accuracy: search and filters return only tasks matching all specified criteria.
- Notification rules: notifications apply only to assigned users; overdue notifications persist until completion; unassigned tasks generate none.

### Error Handling / User Feedback
- Database failures MUST return user-visible error feedback (do not silently swallow errors).
- Authentication failures MUST not reveal whether a user exists.
- Server Action failures MUST be surfaced in the UI in a consistent format.
- Retry mechanisms MAY be added for transient failures; if implemented they SHOULD use bounded retry/backoff.

### Testing Strategy (Technical Requirement)
- The project MUST have automated tests that cover the invariants above.
- Unit tests MUST be implemented with Vitest.
- Property-based tests MUST be implemented with fast-check.
- Property-based tests MUST run with a minimum of 100 iterations per property (unless a test is demonstrably too slow and explicitly approved to reduce).
- Property tests SHOULD be tagged/named consistently to map back to the invariants.

## Goals / Non-Goals
- Goals:
  - Deliver the functional requirements (tasks, categories, dependencies, views, notifications, auth, persistence).
  - Keep the documented tech stack and patterns consistent across the codebase.
  - Make invariants explicit so they are enforced server-side.
- Non-Goals:
  - Implement features or refactor code during the proposal stage.
  - Introduce new capabilities beyond the documented requirements.

## Decisions
- Decision: Keep the current tech stack as the documented target.
  - Next.js App Router with React Server Components; use Client Components only for interactive UI.
  - Data access via Server Actions (no REST/GraphQL) unless later requested.
  - PostgreSQL (Neon) with Drizzle ORM.
  - Better Auth for email/password authentication.
  - Zod for validation (shared across server/client).
  - React Hook Form for forms.
  - TailwindCSS + shadcn/ui for UI components.
  - Biome for lint/format.

- Decision: Household scoping and invariants are enforced server-side.
  - All task/category operations are household-scoped.
  - Assignment restricted to users within the same household.
  - A blocked task cannot be marked done until its blocker is complete.
  - Circular dependencies are rejected.
  - Completing a task records `completedAt`.

- Decision: Do not adopt Kiro’s proposed `features/` folder structure as a requirement.
  - Rationale: The current repository already uses `src/app`, `src/lib`, `src/components`.
  - If you later want a repo-wide restructure, that should be a separate, explicit change proposal.

## Key Domain Models (aligned to current DB schema)
- Household: `households` table (id, name, createdAt).
- User: Better Auth `user` table extended with `householdId`.
- Category: `categories` (household-scoped; name; color; createdAt).
- Task: `tasks` (household-scoped; title/description/status/priority/dueDate/completedAt; optional assignee/category; `blockedByTaskId`).

## Risks / Trade-offs
- Notifications: Requirements call for in-app due/overdue notifications. If the app remains server-action driven, notifications likely require a polling/refresh strategy or server-rendered “notification center” derived from due/overdue queries.
- Testing: The Kiro plan includes property tests; the repo does not yet document a testing strategy in `openspec/project.md`. This proposal keeps test tasks but leaves the choice of framework as an explicit follow-up.

## Migration Plan
1. Land this OpenSpec change proposal.
2. After approval, implement tasks sequentially.
3. After implementation, ensure `openspec/specs/household-task-tracker/` reflects the built behavior.

## Open Questions
- Do you want the OpenSpec tasks checklist to be primarily “build plan” (feature implementation) or primarily “docs migration + verification”? This proposal currently captures the Kiro build-plan tasks.
- What testing framework should be used for the proposed unit/property tests (Vitest/Jest/Playwright/etc.)?
