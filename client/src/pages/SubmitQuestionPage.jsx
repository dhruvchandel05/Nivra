import { useState } from 'react'
import api from '../api/client.js'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Label } from '../components/ui/label.jsx'
import { Textarea } from '../components/ui/textarea.jsx'

export default function SubmitQuestionPage() {
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('submitting')
    try {
      await api.post('/questions/submit', { question })
      setStatus('success')
      setQuestion('')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Submit a Question</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Can&apos;t find your answer? Ask here and an admin will respond. Once answered, your question
        may also be added to our knowledge base to help other students.
      </p>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Your question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label htmlFor="question" className="sr-only">
              Your question
            </Label>
            <Textarea
              id="question"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            {status === 'error' && <p className="text-sm text-destructive">{error}</p>}
            {status === 'success' && (
              <p className="text-sm text-emerald-600">
                Thanks! Your question was submitted. An admin will respond soon.
              </p>
            )}
            <Button type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Submitting…' : 'Submit Question'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
