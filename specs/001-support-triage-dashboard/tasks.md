# Tasks: Customer Support Triage Dashboard

**Input**: Design documents from `specs/001-support-triage-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: TDD is mandatory for triage engine logic per constitution. Tests MUST be written and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialisation and basic structure

- [ ] T001 Initialise Vite + React + TypeScript project at repository root
- [ ] T002 Install and configure Tailwind CSS
- [ ] T003 Install and configure Vitest
- [ ] T004 [P] Create TypeScript interfaces in src/types.ts (RawMessage, TriagedMessage, Category, Priority)
- [ ] T005 [P] Create 18 hard-coded raw messages in src/data/messages.ts

**Checkpoint**: Project builds, tests run (empty), types defined, sample data ready

---

## Phase 2: User Story 1 - View Triage Summary (Priority: P1) MVP

**Goal**: Support lead sees summary counts by category and priority on page load

**Independent Test**: Load page, verify summary cards show correct counts matching the 18 messages

### Tests for User Story 1 (TDD - write first, must FAIL)

- [ ] T006 [P] [US1] Write unit tests for categorise() in tests/categorise.test.ts
- [ ] T007 [P] [US1] Write unit tests for prioritise() in tests/prioritise.test.ts
- [ ] T008 [US1] Write integration test for triage() pipeline in tests/triage.test.ts

### Implementation for User Story 1

- [ ] T009 [US1] Implement categorise() keyword rules in src/engine/categorise.ts (make T006 pass)
- [ ] T010 [US1] Implement prioritise() keyword rules in src/engine/prioritise.ts (make T007 pass)
- [ ] T011 [US1] Implement triage() orchestrator in src/engine/triage.ts (make T008 pass)
- [ ] T012 [US1] Build SummaryCards component in src/components/SummaryCards.tsx
- [ ] T013 [US1] Wire App.tsx to run triage on messages and render SummaryCards

**Checkpoint**: Page loads showing correct summary counts. All triage engine tests pass green.

---

## Phase 3: User Story 2 - Browse and Filter Messages (Priority: P2)

**Goal**: Support lead sees all messages in a table and can filter by category and/or priority

**Independent Test**: Select filter values, verify list updates correctly

### Implementation for User Story 2

- [ ] T014 [P] [US2] Build MessageRow component in src/components/MessageRow.tsx
- [ ] T015 [US2] Build MessageTable component in src/components/MessageTable.tsx
- [ ] T016 [US2] Build FilterBar component in src/components/FilterBar.tsx
- [ ] T017 [US2] Wire FilterBar + MessageTable into App.tsx with filter state

**Checkpoint**: Full message list visible. Filtering by category, priority, or both works instantly.

---

## Phase 4: User Story 3 - Resolve Messages (Priority: P3)

**Goal**: Support lead can mark messages as resolved; resolved messages are visually distinct; summary updates

**Independent Test**: Click resolve, verify visual change and summary count decrement

### Implementation for User Story 3

- [ ] T018 [US3] Add resolved state management to App.tsx
- [ ] T019 [US3] Add Resolve/Unresolve button to MessageRow
- [ ] T020 [US3] Update SummaryCards to exclude resolved messages from counts

**Checkpoint**: Resolve/unresolve works. Summary counts reflect only active messages.

---

## Phase 5: User Story 4 - Visual Priority Indicators (Priority: P4)

**Goal**: High-priority messages are visually distinct (colour, icon, or badge)

**Independent Test**: Verify High-priority rows have distinct visual treatment

### Implementation for User Story 4

- [ ] T021 [US4] Add priority colour coding to MessageRow (red/amber/green left border or badge)
- [ ] T022 [US4] Add priority colour coding to SummaryCards

**Checkpoint**: High-priority messages are immediately visually distinguishable.

---

## Phase 6: User Story 5 - Queue Insights Panel (Priority: P5) *(Innovation)*

**Goal**: Generate 2–4 actionable insights from the current queue via an AI skill, with strict guardrails (max 4, no PII, no fabricated history) and graceful fallback when not configured

**Independent Test**: Validate the skill output guardrails and verify the UI renders insights (or a clear unavailable state) without breaking the core dashboard

### Tests for User Story 5 (TDD - write first, must FAIL)

- [ ] T023 [P] [US5] Write unit tests for Queue Insights guardrails + parsing in tests/queueInsights.test.ts

### Implementation for User Story 5

- [ ] T024 [US5] Update skills/queue-insights/SKILL.md to define queue-insights I/O contract + guardrails (no brand references)
- [ ] T025 [US5] Implement src/engine/queueInsights.ts (client request + output validation; make T023 pass)
- [ ] T026 [US5] Add Vercel serverless function api/queue-insights.js (calls model using OPENAI_API_KEY; returns strict JSON; returns “not configured” when missing key)
- [ ] T027 [US5] Add “Queue Insights” section inside src/components/SummaryCards.tsx (no new component file) and wire to queueInsights client
- [ ] T028 [US5] Ensure graceful fallback UI state when insights unavailable (no key / error / invalid output)

**Checkpoint**: Insights render 2–4 items when configured; guardrails enforced; failure does not break dashboard.

---

## Phase 7: Polish & Deploy

**Purpose**: Final quality pass and deployment

- [ ] T029 [P] Write README.md (how to run, approach, classification logic, queue-insights contract/guardrails, improvements)
- [ ] T030 [P] Clean up and refactor code
- [ ] T031 Deploy to Vercel and verify public URL
- [ ] T032 Final smoke test: load deployed URL, verify summary, insights, filters, resolve, priority indicators
- [ ] T033 Initialise git repo, commit all code, push to GitHub

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (types + data) - BLOCKS all other stories
- **US2 (Phase 3)**: Depends on Phase 2 (needs triaged messages from triage engine)
- **US3 (Phase 4)**: Depends on Phase 3 (needs message table to add resolve to)
- **US4 (Phase 5)**: Depends on Phase 3 (needs message rows to add colour to)
- **US5 (Phase 6)**: Depends on Phase 2 (uses triaged messages) and Phase 4/5 for best signal (resolved + priority cues)
- **Polish (Phase 7)**: Depends on all desired stories being complete

### Within User Story 1 (TDD Flow)

1. T006 + T007 tests written in parallel (MUST FAIL)
2. T009 + T010 implementation in parallel (make tests PASS)
3. T008 integration test (MUST FAIL)
4. T011 triage orchestrator (make T008 PASS)
5. T012 + T013 UI (SummaryCards + App wiring)

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Triage engine (TDD) + Summary UI
3. **STOP and VALIDATE**: Tests pass, page shows correct summary
4. Continue to Phase 3-5 incrementally
5. Deploy in Phase 7

### Time Budget (24h constraint)

- Phase 1 Setup: ~30 min
- Phase 2 TDD + Summary: ~2 hours
- Phase 3 Table + Filters: ~1.5 hours
- Phase 4 Resolve: ~45 min
- Phase 5 Priority indicators: ~30 min
- Phase 6 Queue Insights (optional): ~30 min
- Phase 7 Polish + Deploy: ~1 hour
- Buffer: remaining time for fixes
