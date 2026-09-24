import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Label } from '../../components/ui/label.jsx'
import { Textarea } from '../../components/ui/textarea.jsx'

const emptyForm = { id: null, title: '', description: '' }

export default function ManageAnnouncementsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadItems = () => {
    setLoading(true)
    return api
      .get('/announcements')
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleEdit = (item) => {
    setForm({ id: item.id, title: item.title || '', description: item.description || '' })
  }

  const handleCancel = () => setForm(emptyForm)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const payload = { title: form.title, description: form.description }
    try {
      if (form.id) {
        await api.put(`/admin/announcements/${form.id}`, payload)
      } else {
        await api.post('/admin/announcements', payload)
      }
      setForm(emptyForm)
      await loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await api.del(`/admin/announcements/${id}`)
      await loadItems()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Manage Announcements</h1>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{form.id ? 'Edit announcement' : 'Add new announcement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={handleChange('title')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange('description')}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : form.id ? 'Update' : 'Add Announcement'}
                </Button>
                {form.id && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          {loading && <p className="text-muted-foreground">Loading announcements…</p>}
          {!loading && items.length === 0 && <p className="text-muted-foreground">No announcements yet.</p>}

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-muted/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="my-1 text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-foreground">{item.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
