import { RAW_MESSAGES } from './data/messages'
import { triage } from './engine/triage'
import { SummaryCards } from './components/SummaryCards'
import { FilterBar } from './components/FilterBar'
import { MessageTable } from './components/MessageTable'
import type { Category, Priority, TriagedMessage } from './types'
import { useMemo, useState } from 'react'

function App() {
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')

  const [messages, setMessages] = useState<TriagedMessage[]>(() => triage(RAW_MESSAGES))

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (category !== 'All' && m.category !== category) return false
      if (priority !== 'All' && m.priority !== priority) return false
      return true
    })
  }, [messages, category, priority])

  const toggleResolved = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, resolved: !m.resolved } : m)))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900">Support Triage Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Lightweight internal triage: category + priority assignment, counts, and filtering.
        </p>

        <SummaryCards messages={messages} />

        <FilterBar
          category={category}
          priority={priority}
          onCategoryChange={setCategory}
          onPriorityChange={setPriority}
          onClear={() => {
            setCategory('All')
            setPriority('All')
          }}
        />

        <MessageTable messages={filtered} onToggleResolved={toggleResolved} />
      </div>
    </div>
  )
}

export default App
