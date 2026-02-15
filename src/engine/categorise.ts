import type { Category } from '../types'

function includesAnyPhrase(haystack: string, phrases: string[]) {
  return phrases.some((p) => haystack.includes(p))
}

function includesAnyWord(haystack: string, words: string[]) {
  return words.some((w) => {
    // Use word-boundary matching to avoid substring traps (e.g. "add" in "address")
    const re = new RegExp(`\\b${escapeRegExp(w)}\\b`, 'i')
    return re.test(haystack)
  })
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function categorise(body: string): Category {
  const text = body.toLowerCase()

  const billingWords = ['invoice', 'charged', 'charge', 'billing', 'payment', 'refund', 'subscription', 'renewal', 'card']
  const bugWords = ['crash', 'crashes', 'crashing', 'bug', 'error', 'broken', 'fails', 'failed']
  const bugPhrases = ['not working']

  // Keep feature request signals relatively specific (avoid generic "add")
  const featureWords = ['request', 'support', 'suggestion', 'integration']
  const featurePhrases = ['feature request', 'support for', 'would be nice', 'please add', 'can you add', 'could you add', 'dark mode']

  // Priority of matching: Billing > Bug > Feature Request > General
  // Rationale: billing and bug issues are typically more actionable/urgent.
  if (includesAnyWord(text, billingWords)) return 'Billing'
  if (includesAnyWord(text, bugWords) || includesAnyPhrase(text, bugPhrases)) return 'Bug'
  if (includesAnyWord(text, featureWords) || includesAnyPhrase(text, featurePhrases)) return 'Feature Request'
  return 'General'
}

