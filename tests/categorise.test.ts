import { describe, expect, it } from 'vitest'
import { categorise } from '../src/engine/categorise.ts'

describe('categorise()', () => {
  it('classifies billing issues', () => {
    expect(categorise('My invoice is wrong — I was charged twice.')).toBe('Billing')
    expect(categorise('Please refund last month, payment went through twice.')).toBe('Billing')
    expect(categorise('I need help with my subscription renewal and billing.')).toBe('Billing')
  })

  it('classifies bugs and crashes', () => {
    expect(categorise('The app keeps crashing when I upload a file.')).toBe('Bug')
    expect(categorise('Getting an error when trying to log in.')).toBe('Bug')
    expect(categorise('This feature is broken and not working after the update.')).toBe('Bug')
  })

  it('classifies feature requests', () => {
    expect(categorise('Can you add support for dark mode in the next release?')).toBe('Feature Request')
    expect(categorise('Feature request: export my data as CSV.')).toBe('Feature Request')
    expect(categorise('Please add an integration with Slack.')).toBe('Feature Request')
  })

  it('defaults to General when no keywords match', () => {
    expect(categorise('Thanks — just wanted to say the new UI looks great.')).toBe('General')
    expect(categorise('How do I change my email address?')).toBe('General')
  })
})

