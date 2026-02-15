import { describe, expect, it } from 'vitest'
import { prioritise } from '../src/engine/prioritise.ts'

describe('prioritise()', () => {
  it('classifies urgent / blocked language as High', () => {
    expect(prioritise("URGENT: I can't access my account")).toBe('High')
    expect(prioritise('The app crashes every time I try to upload')).toBe('High')
    expect(prioritise('Payment failed and I was charged twice')).toBe('High')
  })

  it('classifies mild / non-blocking language as Low', () => {
    expect(prioritise('Would be nice to have dark mode')).toBe('Low')
    expect(prioritise('Just a suggestion: add a keyboard shortcut')).toBe('Low')
  })

  it('defaults to Medium when no strong signals exist', () => {
    expect(prioritise('How do I change my email address?')).toBe('Medium')
    expect(prioritise('I have a question about a feature')).toBe('Medium')
  })
})

