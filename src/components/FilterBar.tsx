import type { Category, Priority } from '../types'

const CATEGORY_OPTIONS: Array<Category | 'All'> = ['All', 'Bug', 'Billing', 'Feature Request', 'General']
const PRIORITY_OPTIONS: Array<Priority | 'All'> = ['All', 'High', 'Medium', 'Low']

export function FilterBar(props: {
  category: Category | 'All'
  priority: Priority | 'All'
  onCategoryChange: (v: Category | 'All') => void
  onPriorityChange: (v: Priority | 'All') => void
  onClear: () => void
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Category</span>
          <select
            className="h-10 rounded-lg border bg-white px-3 text-sm"
            value={props.category}
            onChange={(e) => props.onCategoryChange(e.target.value as Category | 'All')}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Priority</span>
          <select
            className="h-10 rounded-lg border bg-white px-3 text-sm"
            value={props.priority}
            onChange={(e) => props.onPriorityChange(e.target.value as Priority | 'All')}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        className="h-10 rounded-lg border px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        onClick={props.onClear}
      >
        Clear filters
      </button>
    </div>
  )
}

