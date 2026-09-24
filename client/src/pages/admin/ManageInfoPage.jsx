import { FileUp, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Label } from '../../components/ui/label.jsx'
import { Textarea } from '../../components/ui/textarea.jsx'

const emptyForm = { id: null, category: '', question: '', answer: '', keywords: '' }

let draftIdCounter = 0
function nextDraftId() {
  draftIdCounter += 1
  return draftIdCounter
}

export default function ManageInfoPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [pdfFile, setPdfFile] = useState(null)
  const [pdfInputKey, setPdfInputKey] = useState(0)
  const [extracting, setExtracting] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [drafts, setDrafts] = useState([])

  const loadItems = () => {
    setLoading(true)
    return api
      .get('/admin/info')
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      category: item.category || '',
      question: item.question || '',
      answer: item.answer || '',
      keywords: item.keywords || '',
    })
  }

  const handleCancel = () => setForm(emptyForm)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const payload = {
      category: form.category,
      question: form.question,
      answer: form.answer,
      keywords: form.keywords,
    }
    try {
      if (form.id) {
        await api.put(`/admin/info/${form.id}`, payload)
      } else {
        await api.post('/admin/info', payload)
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
    if (!window.confirm('Delete this knowledge base entry?')) return
    try {
      await api.del(`/admin/info/${id}`)
      await loadItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePdfChange = (e) => {
    setPdfFile(e.target.files?.[0] || null)
    setPdfError('')
  }

  const handleExtractPdf = async () => {
    if (!pdfFile) return
    setPdfError('')
    setExtracting(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      const data = await api.upload('/admin/info/extract-pdf', formData)
      const extracted = (data.items || []).map((item) => ({
        draftId: nextDraftId(),
        category: item.category || '',
        question: item.question || '',
        answer: item.answer || '',
        keywords: item.keywords || '',
        saving: false,
      }))
      setDrafts((prev) => [...extracted, ...prev])
      setPdfFile(null)
      setPdfInputKey((k) => k + 1)
    } catch (err) {
      setPdfError(err.message)
    } finally {
      setExtracting(false)
    }
  }

  const handleDraftChange = (draftId, field) => (e) => {
    const { value } = e.target
    setDrafts((prev) => prev.map((d) => (d.draftId === draftId ? { ...d, [field]: value } : d)))
  }

  const handleDraftDiscard = (draftId) => {
    setDrafts((prev) => prev.filter((d) => d.draftId !== draftId))
  }

  const handleDraftSave = async (draftId) => {
    const draft = drafts.find((d) => d.draftId === draftId)
    if (!draft) return
    setDrafts((prev) => prev.map((d) => (d.draftId === draftId ? { ...d, saving: true } : d)))
    try {
      await api.post('/admin/info', {
        category: draft.category,
        question: draft.question,
        answer: draft.answer,
        keywords: draft.keywords,
      })
      setDrafts((prev) => prev.filter((d) => d.draftId !== draftId))
      await loadItems()
    } catch (err) {
      setPdfError(err.message)
      setDrafts((prev) => prev.map((d) => (d.draftId === draftId ? { ...d, saving: false } : d)))
    }
  }

  const handleSaveAllDrafts = async () => {
    for (const draft of drafts) {
      // eslint-disable-next-line no-await-in-loop
      await handleDraftSave(draft.draftId)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Manage Info</h1>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{form.id ? 'Edit entry' : 'Add new entry'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category} onChange={handleChange('category')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="question">Question</Label>
                <Input id="question" value={form.question} onChange={handleChange('question')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="answer">Answer</Label>
                <Textarea id="answer" rows={3} value={form.answer} onChange={handleChange('answer')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input id="keywords" value={form.keywords} onChange={handleChange('keywords')} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : form.id ? 'Update Entry' : 'Add Entry'}
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

        <Card className="h-fit rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Upload PDF to auto-extract entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Upload a college brochure, circular, or notice as a PDF. Gemini will read it and suggest
              knowledge-base entries for you to review before saving.
            </p>
            <div className="space-y-3">
              <Input
                key={pdfInputKey}
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
              />
              {pdfError && <p className="text-sm text-destructive">{pdfError}</p>}
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={!pdfFile || extracting}
                onClick={handleExtractPdf}
              >
                <FileUp className="size-4" />
                {extracting ? 'Extracting…' : 'Extract entries from PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {drafts.length > 0 && (
          <Card className="rounded-2xl shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Extracted entries to review ({drafts.length})
              </CardTitle>
              <Button type="button" size="sm" onClick={handleSaveAllDrafts}>
                Save all
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {drafts.map((draft) => (
                  <div key={draft.draftId} className="rounded-2xl border border-border bg-muted/50 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Input value={draft.category} onChange={handleDraftChange(draft.draftId, 'category')} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Keywords</Label>
                        <Input value={draft.keywords} onChange={handleDraftChange(draft.draftId, 'keywords')} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Question</Label>
                        <Input value={draft.question} onChange={handleDraftChange(draft.draftId, 'question')} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Answer</Label>
                        <Textarea rows={2} value={draft.answer} onChange={handleDraftChange(draft.draftId, 'answer')} />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={draft.saving}
                        onClick={() => handleDraftSave(draft.draftId)}
                      >
                        {draft.saving ? 'Saving…' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={draft.saving}
                        onClick={() => handleDraftDiscard(draft.draftId)}
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="lg:col-span-2">
          {loading && <p className="text-muted-foreground">Loading entries…</p>}
          {!loading && items.length === 0 && <p className="text-muted-foreground">No knowledge base entries yet.</p>}

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-muted/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary">{item.category}</Badge>
                    <h3 className="mt-2 mb-1 font-medium text-foreground">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                    {item.keywords && (
                      <p className="mt-2 text-xs text-muted-foreground">Keywords: {item.keywords}</p>
                    )}
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
