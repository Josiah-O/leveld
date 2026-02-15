import { describe, expect, it } from 'vitest'
import { triage } from '../src/engine/triage.ts'

describe('triage()', () => {
  it('returns triaged messages with category + priority assigned', () => {
    const input = [
      { id: 'm1', body: 'My invoice is wrong — charged twice.' },
      { id: 'm2', body: 'The app crashes when I upload a file.' },
      { id: 'm3', body: 'Can you add dark mode?' },
      { id: 'm4', body: 'Thanks! Love the product.' },
    ]

    const out = triage(input)

    expect(out).toHaveLength(4)
    expect(out[0]).toMatchObject({ id: 'm1', category: 'Billing' })
    expect(out[1]).toMatchObject({ id: 'm2', category: 'Bug', priority: 'High' })
    expect(out[2]).toMatchObject({ id: 'm3', category: 'Feature Request' })
    expect(out[3]).toMatchObject({ id: 'm4', category: 'General' })
  })
})

