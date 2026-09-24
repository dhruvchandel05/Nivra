import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Label } from '../../components/ui/label.jsx'
import { Textarea } from '../../components/ui/textarea.jsx'

function ResponseForm({ item, onRespond }) {
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [keywords, setKeywords] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onRespond(item.id, { answer, category, keywords })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <Label>Response</Label>
        <Textarea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} required />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label>Keywords</Label>
          <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Publishing…' : 'Respond & Publish to KB'}
      </Button>
    </form>
  )
}

export default function UnansweredQueuePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadItems = () => {
    setLoading(true)
    return api
      .get('/admin/unanswered?status=pending')
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleRespond = async (id, payload) => {
    await api.post(`/admin/unanswered/${id}/respond`, payload)
    await loadItems()
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Unanswered Queue</h1>

      {loading && <p className="mt-4 text-muted-foreground">Loading pending questions…</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <Card className="mt-5 rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="font-medium text-foreground">Inbox is clear</p>
            <p className="text-sm text-muted-foreground">No pending questions. All caught up!</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 flex flex-col gap-4">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl shadow-sm">
            <CardContent>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-foreground">{item.question}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.user_name} · {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
              <ResponseForm item={item} onRespond={handleRespond} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
