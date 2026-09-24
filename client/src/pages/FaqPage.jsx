import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import { Input } from '../components/ui/input.jsx'

export default function FaqPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('q', search)
    const qs = params.toString()

    api
      .get(`/faq${qs ? `?${qs}` : ''}`)
      .then((data) => {
        if (mounted) setItems(data.items || [])
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [search, category])

  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category).filter(Boolean))
    return Array.from(set)
  }, [items])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Frequently Asked Questions</h1>

      <div className="mt-5 mb-6 flex flex-wrap gap-3">
        <Input
          type="text"
          placeholder="Search FAQs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 w-[200px] rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-muted-foreground">Loading FAQs…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && items.length === 0 && <p className="text-muted-foreground">No FAQs found.</p>}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <details key={item.id} className="group rounded-2xl bg-muted p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
              <span>{item.question}</span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
