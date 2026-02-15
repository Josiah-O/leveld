import type { Priority } from '../types'

function includesAny(haystack: string, needles: string[]) {
  return needles.some((n) => haystack.includes(n))
}

export function prioritise(body: string): Priority {
  const text = body.toLowerCase()

  const highSignals = [
    'urgent',
    'asap',
    "can't access",
    'cannot access',
    "can’t access",
    'locked out',
    'crash',
    'crashing',
    'charged twice',
    'double charged',
    'payment failed',
  ]

  const lowSignals = [
    'would be nice',
    'suggestion',
    'nice to have',
    'not urgent',
    'when you get a chance',
  ]

  if (includesAny(text, highSignals)) return 'High'
  if (includesAny(text, lowSignals)) return 'Low'
  return 'Medium'
}

