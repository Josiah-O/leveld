import type { RawMessage, TriagedMessage } from '../types'
import { categorise } from './categorise'
import { prioritise } from './prioritise'

export function triage(messages: RawMessage[]): TriagedMessage[] {
  return messages.map((m) => ({
    ...m,
    category: categorise(m.body),
    priority: prioritise(m.body),
    resolved: false,
  }))
}

