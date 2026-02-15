import { describe, expect, it } from 'vitest'
import { validateQueueInsightsResponse } from '../src/engine/queueInsights.ts'

describe('queue insights validation (guardrails)', () => {
  it('accepts a valid response with up to 4 insights', () => {
    const input = {
      insights: [
        {
          title: 'Bug cluster in login flows',
          body: 'Multiple unresolved Bug items mention access/auth. Treat as potential incident and prioritize investigation.',
          severity: 'critical',
          actions: ['Check recent deploys', 'Confirm scope with support'],
        },
        {
          title: 'Billing friction signals',
          body: 'Several Billing messages mention charges/refunds. Consider proactively reviewing payment processor logs.',
          severity: 'warning',
          actions: ['Review payment failures', 'Draft customer comms'],
        },
      ],
    }

    const res = validateQueueInsightsResponse(input)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.data.insights).toHaveLength(2)
  })

  it('rejects responses with more than 4 insights', () => {
    const input = {
      insights: new Array(5).fill(null).map((_, i) => ({
        title: `Insight ${i + 1}`,
        body: 'Concise and actionable.',
        severity: 'info',
        actions: [],
      })),
    }

    const res = validateQueueInsightsResponse(input)
    expect(res.ok).toBe(false)
  })

  it('rejects PII-like content (emails)', () => {
    const input = {
      insights: [
        {
          title: 'Follow up with customer',
          body: 'Reach out to josh@example.com to confirm details.',
          severity: 'warning',
          actions: ['Send email'],
        },
      ],
    }

    const res = validateQueueInsightsResponse(input)
    expect(res.ok).toBe(false)
  })

  it('rejects invented historical baselines', () => {
    const input = {
      insights: [
        {
          title: 'Bug volume is 2x normal',
          body: 'Bug reports are 2x higher than usual this week.',
          severity: 'critical',
          actions: ['Escalate'],
        },
      ],
    }

    const res = validateQueueInsightsResponse(input)
    expect(res.ok).toBe(false)
  })
})

