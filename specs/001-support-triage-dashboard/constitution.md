# Customer Support Triage Dashboard Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)
All triage logic (categorisation, prioritisation) MUST be developed using strict TDD:
- Write failing tests first (Red)
- Implement the simplest code to pass (Green)
- Refactor for clarity (Refactor)

UI components may use lighter testing, but the triage engine has zero exceptions.

### II. Simplicity Over Abstraction
- Use plain functions and flat modules; no unnecessary class hierarchies
- No databases, no auth, no backend server unless strictly needed
- Prefer a single-page client-side app with hard-coded data
- Every added dependency MUST be justified

### III. Explainability of Rules
- Categorisation and prioritisation rules MUST be readable as a keyword/rule table
- The README MUST explain how classification works so a non-developer can understand
- Tie-breaking and default-category logic MUST be documented in code comments and README

### IV. Usability for a Support Lead
- The dashboard is designed for a support lead's "morning triage" workflow
- Summary counts MUST be visible without scrolling
- High-priority messages MUST have clear visual distinction
- Filtering MUST be fast (instant, client-side) with no page reloads

### V. Ship Within Constraint
- The 24-hour deadline governs scope decisions; cut features, not quality
- The app MUST be deployed with a public link (Vercel, Cloudflare Pages, or similar)
- The repo MUST include a README covering: how to run, approach, classification logic, and improvements

## Constraints

- No authentication, no database, no production infrastructure required
- Messages are hard-coded (15-20 fake support messages)
- Client-side only; static deployment target
- Must work in modern browsers (Chrome, Firefox, Safari, Edge latest)

## Development Workflow

- Spec first: define what we build and why before touching code
- Plan second: lock tech stack and file structure
- Tasks third: ordered checklist with TDD tasks before implementation tasks
- Implement: tests red, then code green, then deploy
- Commit after each logical unit of work

## Governance

This constitution governs all decisions for the 001-support-triage-dashboard feature. Scope additions require explicit justification against the 24-hour constraint. Simplicity and completeness of core requirements take precedence over bonus features.

**Version**: 1.0.0 | **Ratified**: 2026-02-15 | **Last Amended**: 2026-02-15
