import type { Category, Priority, TriagedMessage } from '../types'
import { useEffect, useState } from 'react'
import { fetchQueueInsights, type QueueInsight } from '../engine/queueInsights'

const CATEGORIES: Category[] = ['Bug', 'Billing', 'Feature Request', 'General']
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']

function countBy<T extends string>(items: TriagedMessage[], key: 'category' | 'priority'): Record<T, number> {
  return items.reduce((acc, item) => {
    const k = item[key] as T
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<T, number>)
}

export function SummaryCards(props: { messages: TriagedMessage[] }) {
  const active = props.messages.filter((m) => !m.resolved)
  const byCategory = countBy<Category>(active, 'category')
  const byPriority = countBy<Priority>(active, 'priority')

  const [insights, setInsights] = useState<QueueInsight[] | null>(null)
  const [insightsStatus, setInsightsStatus] = useState<'loading' | 'ok' | 'unavailable'>('loading')
  const [insightsReason, setInsightsReason] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    setInsightsStatus('loading')
    setInsightsReason(null)
    fetchQueueInsights(props.messages, { signal: ac.signal }).then((r) => {
      if (r.kind === 'ok') {
        setInsights(r.insights)
        setInsightsStatus('ok')
      } else {
        setInsights(null)
        setInsightsStatus('unavailable')
        setInsightsReason(r.reason)
      }
    })
    return () => ac.abort()
  }, [props.messages])

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-semibold text-gray-700">By category</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => (
            <div key={c} className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-500">{c}</div>
              <div className="text-2xl font-bold text-gray-900">{byCategory[c] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-semibold text-gray-700">By priority</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {PRIORITIES.map((p) => (
            <div key={p} className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs text-gray-500">{p}</div>
              <div className="text-2xl font-bold text-gray-900">{byPriority[p] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">Queue insights</div>
          <div className="text-xs text-gray-500">
            {insightsStatus === 'loading' ? 'Generating…' : insightsStatus === 'ok' ? 'AI' : 'Unavailable'}
          </div>
        </div>

        {insightsStatus === 'ok' && insights && insights.length > 0 ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {insights.map((i) => (
              <div key={i.title} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">{i.title}</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">{i.severity}</div>
                </div>
                <div className="mt-1 text-sm text-gray-700">{i.body}</div>
                {i.actions.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                    {i.actions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-500">
            {insightsStatus === 'loading'
              ? 'Generating insights from the current queue…'
              : insightsReason === 'http_404'
                ? 'Insights unavailable locally (API not running). Run `npm run dev:insights` or deploy to Vercel.'
                : insightsReason === 'not_configured' || insightsReason === 'http_503'
                  ? 'Insights unavailable (missing ANTHROPIC_API_KEY in `.env.local`).'
                  : insightsReason === 'model_error'
                    ? 'Insights unavailable (model error). Check ANTHROPIC_MODEL / API key.'
                  : 'Insights unavailable (not configured or invalid output).'}
          </div>
        )}
      </div>
    </div>
  )
}

