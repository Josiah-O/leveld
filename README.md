# Support Triage Dashboard

**Built for**: Leveld 24-hour challenge
**Live demo**: [Coming soon - deploying to Vercel]
A lightweight customer support triage tool that automatically categorizes and prioritizes incoming messages, giving support leads an instant overview of their queue.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build + start (serves dashboard + AI insights API on port 3000)
npm run build
npm start
```

Then open `http://127.0.0.1:3000` in your browser.

**For Queue Insights (optional):** Copy `.env.example` to `.env.local` and add your Anthropic key:
```
ANTHROPIC_API_KEY=your_key_here
```
Without this, the dashboard works fully — insights just show "Unavailable".

---

## What It Does

Takes 18 hard-coded customer support messages and:
- Classifies each by **category** (Bug, Billing, Feature Request, General)
- Assigns a **priority** (High, Medium, Low)
- Shows summary counts by category and priority
- Lets you filter messages instantly
- Mark messages as resolved (updates counts in real-time)
- Visual priority indicators (color-coded left borders)

---

## How Categorization Works

### Category Assignment (`src/engine/categorise.ts`)

Uses keyword matching with priority ordering: **Billing > Bug > Feature Request > General**

- **Billing**: Matches invoice, charged, payment, refund, subscription, renewal, card
- **Bug**: Matches crash, error, broken, failed, "not working"
- **Feature Request**: Matches request, suggestion, integration, "please add", "support for", "dark mode"
- **General**: Default fallback for everything else

Word-boundary matching prevents false positives (e.g., "add" in "address" won't trigger feature request).

### Priority Assignment (`src/engine/prioritise.ts`)

Three-tier system based on urgency signals:

- **High**: urgent, asap, "can't access", locked out, crash, charged twice, payment failed
- **Low**: suggestion, "would be nice", "when you get a chance"
- **Medium**: Default for everything else

**Why this approach?** Simple, explainable, no API dependencies, runs client-side, and fast. A support lead can understand the logic in 30 seconds.

---

## Architecture Decisions

### Tech Stack
- **React 18** + **TypeScript** - Type safety, component reusability
- **Vite** - Fast builds, dev server
- **Tailwind CSS** - Rapid UI iteration, responsive out of the box
- **Vitest** - Unit tests for triage logic

### Code Structure

```
src/
├── engine/              # Pure functions: triage logic (testable, no DOM)
│   ├── categorise.ts
│   ├── prioritise.ts
│   ├── triage.ts
│   └── queueInsights.ts # Client fetch + output guardrails for AI insights
├── components/          # React UI components
│   ├── SummaryCards.tsx  # Summary cards + Queue Insights panel
│   ├── FilterBar.tsx
│   ├── MessageTable.tsx
│   └── MessageRow.tsx
├── data/
│   └── messages.ts      # 18 hard-coded messages
└── types.ts

skills/
└── queue-insights/
    └── SKILL.md          # AI skill contract: input/output schema + guardrails

api/
└── queue-insights.js     # Vercel serverless function (calls Claude via skill)

scripts/
└── local-api.mjs         # Local server: serves dist/ + /api for npm start
```

**Why this structure?** Separates business logic from UI. The `engine/` directory has zero React dependencies - you can test it without mounting components. The `skills/` directory defines the AI agent contract separately from runtime code, following the skill-driven pattern where the skill file *is* the prompt.

### Testing Strategy

TDD for the triage engine and AI guardrails:
- 12/12 tests passing
- Unit tests for categorise() and prioritise()
- Integration test for full triage pipeline
- Queue Insights guardrail tests (max 4, no PII, no invented history)

**What's tested**: Classification accuracy, edge cases, AI output validation.

**What's not tested**: UI components. For a 24h build, testing the business logic and guardrails was the right trade-off.

---

## Key Features

### 1. Summary Dashboard
Two cards showing counts by category and priority. Only counts **unresolved** messages, so the lead knows their actual workload.

### 2. Filtering
Filter by category, priority, or both. Updates instantly (client-side state). Clear filters button resets to "All".

### 3. Resolve Messages
Click "Resolve" on any message. The message greys out, summary counts update, but it stays in the list (so you can unresolve if needed).

### 4. Visual Priority Indicators
High-priority messages have a red left border, Medium is amber, Low is green. You can spot urgent items without reading.

### 5. Queue Insights (Innovation)
An AI-powered **Queue Insights** panel generates 2–4 actionable insights from the current queue using Claude (Sonnet 4.5). This is built on a **skill-driven architecture**:

- **Skill definition** (`skills/queue-insights/SKILL.md`): Defines the I/O contract, guardrails, and guidance in a standalone markdown file — the skill *is* the prompt.
- **Runtime**: A serverless function (`api/queue-insights.js`) loads the skill file at runtime and sends it to Claude as the system prompt. No insight logic is hardcoded in application code.
- **Guardrails** (enforced by `src/engine/queueInsights.ts`): Max 4 insights, no PII (emails/names), no invented historical baselines, severity must be `info|warning|critical`.
- **Graceful fallback**: If `ANTHROPIC_API_KEY` is not set or Claude returns invalid output, the dashboard shows "Insights unavailable" without breaking.

### 6. Edge Cases Handled
- Empty filter state (shows "No messages match")
- All messages resolved (summary shows 0s)
- AI unavailable (insights panel degrades gracefully)
- Long messages (truncation not implemented - see "What I'd Improve")

---

## What I'd Improve With More Time

### UX Enhancements
1. **Message truncation** - Long messages break table layout. Truncate to ~100 chars with "Read more" expansion.
2. **Sort by priority** - Default sort High → Medium → Low would be more useful than chronological.
3. **Hide resolved toggle** - Option to completely hide resolved messages from the list.
4. **Keyboard shortcuts** - Press 'h' for high priority, 'b' for bugs (power user feature).

### Technical Improvements
1. **Real-time data** - Connect to a WebSocket or polling endpoint for live updates.
2. **Persistence** - Use localStorage to save resolved state across page reloads.
3. **Smarter categorization** - Use AI for triage too (not just insights), with keywords as fallback.
4. **Confidence scores** - Show "Bug (95%)" to indicate classification confidence.
5. **More skills** - Add AI skills for auto-reply drafting, sentiment analysis, or escalation prediction.
6. **Insight caching** - Cache insights client-side to avoid redundant API calls on re-renders.

### Code Quality
1. **UI component tests** - Add React Testing Library tests for components.
2. **Accessibility** - ARIA labels, keyboard navigation, screen reader support.
3. **Mobile optimization** - Table is responsive but could be a card-based layout on mobile.
4. **Error boundaries** - React error boundaries for graceful failure handling.

---

## Why I Made These Choices

### Why keyword matching for triage but AI for insights?
**Right tool for the job.** Categorization and priority need to be fast, explainable, and always available — keyword matching delivers that without API keys or network latency. Queue Insights is *additive analysis* where AI shines: spotting patterns, suggesting actions, summarising the queue in ways a static algorithm can't. The AI layer is optional; the core dashboard never depends on it.

### Why a skill file instead of hardcoded prompts?
**Separation of concerns.** The skill definition (`skills/queue-insights/SKILL.md`) is loaded at runtime, not baked into code. This means the prompt can be reviewed, versioned, and updated independently from the application logic. It follows the skill-driven pattern: the skill file *is* the contract between the application and the AI model.

### Why TDD for engine logic but not UI?
**ROI.** The triage logic is the core business value - getting categorization wrong breaks the whole tool. UI bugs are visible and quick to fix manually. In a 24h window, testing what matters most is the right call.

### Why Tailwind instead of CSS modules?
**Speed.** I can iterate on UI faster with utility classes than writing custom CSS. For a timed challenge, velocity matters.

---

## Queue Insights: Contract & Guardrails

The AI-powered insights panel is the **innovation** component. Here's how it works end-to-end:

### Skill Definition (`skills/queue-insights/SKILL.md`)
A standalone markdown file that defines:
- **Input**: JSON array of messages with `id`, `body`, `category`, `priority`, `resolved`, `date`
- **Output**: Strict JSON with 2–4 insight objects, each having `title`, `body`, `severity`, `actions`
- **Guardrails**: No PII, no invented history, bounded actions (0–3 per insight)

### Runtime Flow
1. **Client** (`src/engine/queueInsights.ts`) scrubs PII from messages, then calls `POST /api/queue-insights`
2. **Server** (`api/queue-insights.js`) loads `SKILL.md` at runtime as the system prompt, calls Claude Sonnet 4.5 with tool calling to enforce structured output
3. **Client** validates the response against all guardrails before rendering
4. **Fallback**: If any step fails, the UI shows "Insights unavailable" without breaking the dashboard

### Guardrails (tested in `tests/queueInsights.test.ts`)
| Rule | Enforcement |
|------|-------------|
| Max 4 insights | Client-side validation rejects arrays > 4 |
| No PII (emails, names) | Regex check on all insight text; PII scrubbed before sending to API |
| No invented history | Regex rejects "baseline", "average", "last week", etc. |
| Severity enum | Must be `info`, `warning`, or `critical` |
| Graceful degradation | Missing API key → 503 "not configured"; model error → UI fallback |

---

## Project Stats

- **Components**: 5
- **Tests**: 12 (100% passing)
- **Messages**: 18
- **AI Skills**: 1 (queue-insights)

---

## What This Demonstrates

**For the role:**
- Can ship working software under tight deadlines
- Pragmatic trade-offs (keywords for triage, AI for insights)
- TDD discipline for critical logic and guardrails
- Skill-driven AI integration with strict output contracts
- Clean code structure (separation of concerns, typed interfaces)
- Product thinking (built for a support lead's workflow, not just the spec)
- Can explain technical decisions clearly

**What I'd bring to Leveld:**
- Bias toward shipping over perfection
- Strong fundamentals (TypeScript, React, testing)
- AI integration with guardrails (not just "call the API and hope")
- User-first thinking (every feature maps to a real support lead need)
- Fast iteration speed

---

## Running Tests

```bash
npm test
```

Tests cover:
- Category assignment for all 4 categories
- Priority assignment for all 3 priorities
- Full triage pipeline (categorize + prioritize + enrich)
- Edge cases (empty input, special characters)
- Queue Insights guardrails (max count, PII detection, invented history rejection)

---

## Deployment

**Production build:**
```bash
npm run build
```

**Deploy to Vercel:**
```bash
vercel --prod
```
Set `ANTHROPIC_API_KEY` as an environment variable in Vercel project settings for Queue Insights.

**Run locally with AI insights:**
```bash
npm run build
npm start
# Serves dashboard + API on http://127.0.0.1:3000
```

---

## Contact

Built by **Josh** for the Leveld Junior Developer challenge.

**Questions?** get@leveld.ai

---

*Built for Leveld's 24-hour product challenge. Categorization is keyword-based and client-side. Queue Insights uses Claude Sonnet 4.5 via a skill-driven serverless function with strict guardrails.*
