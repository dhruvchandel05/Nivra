import { BookOpen, Inbox, MessageCircle, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Skeleton } from '../../components/ui/skeleton.jsx'

const TILES = [
  { key: 'totalUsers', label: 'Registered students', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { key: 'kbSize', label: 'Knowledge base entries', icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
  { key: 'pendingUnanswered', label: 'Pending unanswered', icon: Inbox, color: 'text-amber-600 bg-amber-50' },
  { key: 'totalChats', label: 'Total conversations', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50' },
]

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api
      .get('/admin/reports/summary')
      .then((data) => {
        if (mounted) setSummary(data)
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

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>

      {loading && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile) => (
            <Skeleton key={tile.key} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {summary && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile) => {
            const Icon = tile.icon
            return (
              <Card key={tile.key} className="rounded-2xl shadow-sm">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <div className="font-display text-3xl font-bold text-foreground">
                      {summary[tile.key] ?? 0}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {tile.label}
                    </div>
                  </div>
                  <span className={`flex size-11 items-center justify-center rounded-2xl ${tile.color}`}>
                    <Icon className="size-5" />
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
