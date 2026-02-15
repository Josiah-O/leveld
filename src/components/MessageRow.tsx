import type { TriagedMessage } from '../types'

function priorityClass(priority: TriagedMessage['priority']) {
  switch (priority) {
    case 'High':
      return 'border-l-red-500'
    case 'Medium':
      return 'border-l-amber-500'
    case 'Low':
      return 'border-l-emerald-500'
  }
}

export function MessageRow(props: {
  message: TriagedMessage
  onToggleResolved: (id: string) => void
}) {
  const { message } = props

  return (
    <tr className={message.resolved ? 'opacity-50' : ''}>
      <td className={`border-l-4 ${priorityClass(message.priority)} px-3 py-3 align-top`}>
        <div className="text-sm font-semibold text-gray-900">{message.customerName ?? 'Unknown'}</div>
        <div className="text-xs text-gray-500">{message.date ?? ''}</div>
      </td>
      <td className="px-3 py-3 align-top">
        <div className="text-sm text-gray-900">{message.body}</div>
      </td>
      <td className="px-3 py-3 align-top">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {message.category}
        </span>
      </td>
      <td className="px-3 py-3 align-top">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {message.priority}
        </span>
      </td>
      <td className="px-3 py-3 align-top">
        <button
          type="button"
          className="rounded-lg border px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          onClick={() => props.onToggleResolved(message.id)}
        >
          {message.resolved ? 'Unresolve' : 'Resolve'}
        </button>
      </td>
    </tr>
  )
}

