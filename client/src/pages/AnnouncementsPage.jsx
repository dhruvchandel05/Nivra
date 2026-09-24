import { Badge } from '../components/ui/badge.jsx'
import { Card, CardContent } from '../components/ui/card.jsx'
import api from '../api/client.js'
import { useEffect, useState } from 'react'

function isNew(dateStr) {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  return diffMs >= 0 && diffMs <= 48 * 60 * 60 * 1000
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api
      .get('/announcements')
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
  }, [])

  const sorted = [...items].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Announcements</h1>

      {loading && <p className="mt-4 text-muted-foreground">Loading announcements…</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {!loading && !error && sorted.length === 0 && (
        <p className="mt-4 text-muted-foreground">No announcements yet.</p>
      )}

      <div className="mt-5 flex flex-col gap-4">
        {sorted.map((item) => (
          <Card key={item.id} className="rounded-2xl shadow-sm">
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                {isNew(item.date) && <Badge variant="success">New</Badge>}
              </div>
              <p className="mt-1 mb-3 text-xs text-muted-foreground">
                {new Date(item.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
