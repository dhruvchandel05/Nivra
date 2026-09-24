import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import api from '../../api/client.js'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

export default function ChatHistoryReportsPage() {
  const [series, setSeries] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get('/admin/reports/questions-per-day?days=14'),
      api.get('/admin/reports/top-categories'),
    ])
      .then(([daily, top]) => {
        if (!mounted) return
        setSeries(daily.series || [])
        setCategories(top.categories || [])
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

  const lineData = {
    labels: series.map((s) => s.date),
    datasets: [
      {
        label: 'Questions per day',
        data: series.map((s) => s.count),
        borderColor: '#2d6cdf',
        backgroundColor: 'rgba(45, 108, 223, 0.2)',
        tension: 0.3,
      },
    ],
  }

  const barData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        label: 'Top categories',
        data: categories.map((c) => c.count),
        backgroundColor: '#2d6cdf',
      },
    ],
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Chat History & Reports</h1>
      {loading && <p className="mt-4 text-muted-foreground">Loading reports…</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="mt-5 flex flex-col gap-5">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Questions per day (last 14 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {series.length === 0 ? (
                <p className="text-muted-foreground">No chat activity yet.</p>
              ) : (
                <Line data={lineData} />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-muted-foreground">No category data yet.</p>
              ) : (
                <Bar data={barData} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
