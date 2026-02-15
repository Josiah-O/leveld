export type Category = 'Bug' | 'Billing' | 'Feature Request' | 'General'
export type Priority = 'High' | 'Medium' | 'Low'

export type RawMessage = {
  id: string
  body: string
  customerName?: string
  date?: string // ISO string
}

export type TriagedMessage = RawMessage & {
  category: Category
  priority: Priority
  resolved: boolean
}

