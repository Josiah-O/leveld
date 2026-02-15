import type { TriagedMessage } from '../types'

export type QueueInsightSeverity = 'info' | 'warning' | 'critical'

export type QueueInsight = {
  title: string
  body: string
  severity: QueueInsightSeverity
  actions: string[]
}

export type QueueInsightsResponse = {
  insights: QueueInsight[]
}

export type QueueInsightsValidationResult =
  | { ok: true; data: QueueInsightsResponse }
  | { ok: false; error: string }

const MAX_INSIGHTS = 4
const MAX_TITLE_CHARS = 96
const MAX_BODY_CHARS = 320
const MAX_ACTIONS = 3
const MAX_ACTION_CHARS = 96

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

// Guardrail: prevent invented baselines/history not present in the input queue.
const DISALLOWED_HISTORY_RE = /\b(2x|baseline|normal|usual|histor(?:y|ical)|week over week|yesterday|last week|average)\b/i

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasDisallowedContent(text: string) {
  return EMAIL_RE.test(text) || DISALLOWED_HISTORY_RE.test(text)
}

export function validateQueueInsightsResponse(input: unknown): QueueInsightsValidationResult {
  if (!isPlainObject(input)) return { ok: false, error: 'response must be an object' }
  const insights = input.insights
  if (!Array.isArray(insights)) return { ok: false, error: 'response.insights must be an array' }
  if (insights.length > MAX_INSIGHTS) return { ok: false, error: 'too many insights' }

  const out: QueueInsight[] = []

  for (let idx = 0; idx < insights.length; idx++) {
    const raw = insights[idx]
    if (!isPlainObject(raw)) return { ok: false, error: `insights[${idx}] must be an object` }

    const title = raw.title
    const body = raw.body
    const severity = raw.severity
    const actions = raw.actions

    if (!isNonEmptyString(title)) return { ok: false, error: `insights[${idx}].title must be a non-empty string` }
    if (!isNonEmptyString(body)) return { ok: false, error: `insights[${idx}].body must be a non-empty string` }
    if (title.length > MAX_TITLE_CHARS) return { ok: false, error: `insights[${idx}].title too long` }
    if (body.length > MAX_BODY_CHARS) return { ok: false, error: `insights[${idx}].body too long` }

    if (hasDisallowedContent(title) || hasDisallowedContent(body)) {
      return { ok: false, error: `insights[${idx}] contains disallowed content` }
    }

    if (severity !== 'info' && severity !== 'warning' && severity !== 'critical') {
      return { ok: false, error: `insights[${idx}].severity must be info|warning|critical` }
    }

    if (!Array.isArray(actions)) return { ok: false, error: `insights[${idx}].actions must be an array` }
    if (actions.length > MAX_ACTIONS) return { ok: false, error: `insights[${idx}].actions too long` }

    const cleanedActions: string[] = []
    for (let i = 0; i < actions.length; i++) {
      const a = actions[i]
      if (!isNonEmptyString(a)) return { ok: false, error: `insights[${idx}].actions[${i}] must be a non-empty string` }
      if (a.length > MAX_ACTION_CHARS) return { ok: false, error: `insights[${idx}].actions[${i}] too long` }
      if (hasDisallowedContent(a)) return { ok: false, error: `insights[${idx}].actions[${i}] contains disallowed content` }
      cleanedActions.push(a.trim())
    }

    out.push({ title: title.trim(), body: body.trim(), severity, actions: cleanedActions })
  }

  return { ok: true, data: { insights: out } }
}

// Client helper: calls the serverless function. This does NOT generate insights itself.
// It only requests them and validates the returned JSON against the skill contract.

export type QueueInsightsResult =
  | { kind: 'ok'; insights: QueueInsight[] }
  | { kind: 'unavailable'; reason: string }

function scrubLikelyPII(text: string) {
  // Minimal client-side scrub before sending. Primary PII protection is in the skill guardrails.
  return text.replace(EMAIL_RE, '[redacted-email]')
}

export async function fetchQueueInsights(messages: TriagedMessage[], opts?: { signal?: AbortSignal }): Promise<QueueInsightsResult> {
  const payload = {
    messages: messages.map((m) => ({
      id: m.id,
      body: scrubLikelyPII(m.body).slice(0, 500),
      category: m.category,
      priority: m.priority,
      resolved: m.resolved,
      date: m.date,
    })),
  }

  try {
    const res = await fetch('/api/queue-insights', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: opts?.signal,
    })

    if (!res.ok) {
      // Best-effort: include server's error code to make the UI message useful.
      try {
        const body = (await res.json()) as { error?: string }
        if (body?.error) return { kind: 'unavailable', reason: `${body.error}` }
      } catch {
        // ignore
      }
      return { kind: 'unavailable', reason: `http_${res.status}` }
    }
    const json: unknown = await res.json()
    const validated = validateQueueInsightsResponse(json)
    if (!validated.ok) return { kind: 'unavailable', reason: 'invalid_output' }
    return { kind: 'ok', insights: validated.data.insights }
  } catch {
    return { kind: 'unavailable', reason: 'network_error' }
  }
}

