# Change: Build Household Task Tracker (primary implementation plan)

## Why
The goal is to use OpenSpec as the primary driver for building the Household Task Tracker. This change proposal defines the target requirements/design and provides an ordered, verifiable implementation plan to deliver the app.

## What Changes
- Define the capability requirements as `## ADDED Requirements` (proposal-stage) for `household-task-tracker`.
- Define the technical design constraints (stack, invariants, patterns) in `design.md`.
- Provide a primary build plan in `tasks.md` as an ordered checklist of implementation steps.

## Impact
- Capability: `household-task-tracker`.
- This proposal is expected to drive follow-on implementation work after approval (code changes happen in the apply stage, not in this proposal).
- Inputs referenced during planning:
  - `.kiro/specs/household-task-tracker/{requirements,design,tasks}.md`
  - Existing repo stack and schema (Next.js App Router, Drizzle/Postgres, Better Auth, Zod, shadcn/ui).

## Notes / Mismatches Observed
- The Kiro design proposes a feature-based `features/` folder layout, but the current repo structure is `src/app`, `src/lib`, `src/components`. This proposal documents patterns and invariants without requiring a repo restructure.
- In-app due/overdue notifications are required; current code does not yet appear to contain notification modules. Tasks include building this.

## Approval Gate
Do not start implementation work from these tasks until this proposal is approved.
