import type { TriagedMessage } from '../types'
import { MessageRow } from './MessageRow'

export function MessageTable(props: {
  messages: TriagedMessage[]
  onToggleResolved: (id: string) => void
}) {
  if (props.messages.length === 0) {
    return (
      <div className="mt-6 rounded-xl border bg-white p-6 text-sm text-gray-600">
        No messages match the selected filters.
      </div>
    )
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border bg-white">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
          <tr>
            <th className="px-3 py-3">Customer</th>
            <th className="px-3 py-3">Message</th>
            <th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">Priority</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {props.messages.map((m) => (
            <MessageRow key={m.id} message={m} onToggleResolved={props.onToggleResolved} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

