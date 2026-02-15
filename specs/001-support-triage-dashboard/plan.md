# Implementation Plan: Customer Support Triage Dashboard

**Branch**: `001-support-triage-dashboard` | **Date**: 2026-02-15 | **Spec**: `specs/001-support-triage-dashboard/spec.md`

## Summary

Build a single-page client-side web app that takes 18 hard-coded support messages, classifies them by category and priority using keyword rules, and renders an interactive triage dashboard with summary counts, a filterable message table, resolve functionality, visual priority indicators, and an optional “Queue Insights” panel (innovation). Deploy to a public URL.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 18, Vite 5 (build tooling), Tailwind CSS (utility styling)
**Storage**: N/A (all data hard-coded in-memory, no database)
**Testing**: Vitest (unit tests for triage logic)
**Target Platform**: Modern browsers (static site deployed to Vercel; Queue Insights uses an optional serverless function to avoid exposing API keys client-side)
**Project Type**: Single project (SPA + optional `/api` serverless function for Queue Insights only)
**Performance Goals**: Page load under 2 seconds; instant client-side filtering
**Constraints**: 24-hour build deadline; no auth; no database. Queue Insights may use a minimal serverless function; the core dashboard remains fully functional without AI configuration.
**Scale/Scope**: 18 messages, 1 page, 1 user role (support lead)

## Constitution Check

*GATE: Must pass before implementation.*

- [x] **Simplicity**: Single project, no backend, no database, minimal dependencies (React + Vite + Tailwind + Vitest)
- [x] **TDD**: Triage logic (categorise, prioritise) will have unit tests written before implementation
- [x] **Explainability**: Keyword rules defined as a data structure; README documents the approach
- [x] **Usability**: Summary visible on load; filtering is client-side instant; high-priority has visual treatment
- [x] **Ship Within Constraint**: Static deploy to Vercel; no infrastructure overhead

## Project Structure

### Documentation (this feature)

```text
specs/001-support-triage-dashboard/
├── constitution.md
├── spec.md
├── plan.md
├── tasks.md
└── taskstoissues.md
```

### Source Code (repository root)

```text
src/
├── data/
│   └── messages.ts          # 18 hard-coded support messages (raw, uncategorised)
├── engine/
│   ├── categorise.ts        # Keyword rules → Category assignment
│   ├── prioritise.ts        # Keyword/category rules → Priority assignment
│   └── triage.ts            # Orchestrator: takes raw messages, returns triaged messages
│   └── queueInsights.ts      # Queue insights client + output guardrails (calls /api/queue-insights)
├── components/
│   ├── SummaryCards.tsx      # Category + Priority count cards
│   ├── (Queue Insights)      # Rendered inside SummaryCards.tsx to avoid extra component files
│   ├── MessageTable.tsx      # Filterable message list/table
│   ├── FilterBar.tsx         # Category + Priority filter controls
│   └── MessageRow.tsx        # Single message row with resolve button + priority indicator
├── types.ts                  # TypeScript interfaces (RawMessage, TriagedMessage, Category, Priority)
├── App.tsx                   # Root component composing all above
├── main.tsx                  # Vite entry point
└── index.css                 # Tailwind imports + any global styles

tests/
├── categorise.test.ts        # Unit tests for category assignment
├── prioritise.test.ts        # Unit tests for priority assignment
└── triage.test.ts            # Integration test for full triage pipeline

api/
└── queue-insights.js          # (Vercel) Serverless function: calls model + returns guarded insights JSON
```

**Structure Decision**: Single project (Option 1). No backend needed. All logic is client-side. The `src/engine/` directory isolates pure triage logic (testable with Vitest, no DOM dependency) from `src/components/` (React UI).

## Queue Insights (AI Skill) Integration

- **Skill definition**: `skills/queue-insights/SKILL.md` defines the I/O contract and guardrails for the agent output.
- **Runtime**: UI calls `POST /api/queue-insights` with the current queue (excluding PII fields). The serverless function calls the model using `OPENAI_API_KEY` and returns a strict JSON payload.
- **Degrade gracefully**: If `OPENAI_API_KEY` is not set (local/dev/reviewer), the endpoint returns a clear “not configured” response; the core dashboard still works.

## Complexity Tracking

No violations. The project uses 1 framework (React), 1 build tool (Vite), 1 CSS utility (Tailwind), and 1 test runner (Vitest). All are standard and justified.
