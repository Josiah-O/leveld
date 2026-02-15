---
name: queue-insights
description: Generate 2–4 actionable support-queue insights from the current triage queue (strict JSON output, guarded against PII and invented history).
homepage: (internal)
metadata:
 {
 "openclaw": {},
 }
---

# Queue Insights

Generate concise, actionable insights for a support lead by analyzing the **current** message queue and its existing triage results (category, priority, resolved).

## When to use (trigger phrases)

Use this skill immediately when the user asks any of:

- “show queue insights”
- “what patterns do you see in the queue?”
- “any incidents / spikes?”
- “what should we prioritize right now?”

## Input

You will be given a JSON payload:

- `messages`: array of items with fields:
  - `id` (string)
  - `body` (string, may be truncated; may be scrubbed)
  - `category` ("Bug" | "Billing" | "Feature Request" | "General")
  - `priority` ("High" | "Medium" | "Low")
  - `resolved` (boolean)
  - `date` (optional ISO string)

## Output (STRICT)

Return **ONLY** valid JSON (no markdown, no commentary) matching:

```json
{
  "insights": [
    {
      "title": "Short headline",
      "body": "1–2 sentences, actionable, based only on the provided queue",
      "severity": "info|warning|critical",
      "actions": ["Action 1", "Action 2"]
    }
  ]
}
```

Constraints:

- Produce **2–4** insights (never more than 4).
- `actions` MUST be an array with **0–3** short action strings.

## Guardrails (NON-NEGOTIABLE)

- **No PII**: Do not include customer names, emails, phone numbers, addresses, or direct verbatim quotes from messages.
- **No invented history**: Do not claim baselines or trends you can’t prove from the provided queue (no “2x normal”, no “average”, no “last week”).
- **Be specific but bounded**: You may reference categories/priorities (“High priority Bugs”) and general themes (“login”, “refunds”) only.
- **If nothing stands out**: Return fewer insights (2 is acceptable), but still follow the JSON schema.

## Guidance (what “good” looks like)

- Prefer insights that help a support lead decide **what to do next** (escalate, investigate, communicate, mitigate).
- Avoid restating raw counts unless it implies action (e.g., “multiple High priority access issues → possible incident”).
- Keep language crisp and operational.

## Notes

- Do not reuse boilerplate phrasing. Tailor insights to the provided queue contents.
