import { Mic, MicOff, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import api from '../api/client.js'
import MessageBubble from '../components/MessageBubble.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card } from '../components/ui/card.jsx'
import { Input } from '../components/ui/input.jsx'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
]

const EXAMPLE_QUESTIONS = [
  'What documents do I need for admission?',
  'When does the semester start?',
  'How do I apply for a scholarship?',
  'Where is the examination cell located?',
]

let idCounter = 0
function nextId() {
  idCounter += 1
  return idCounter
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('en')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const { supported, listening, transcript, start, stop } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) setInput(transcript)
  }, [transcript])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const sendQuestion = async (question) => {
    const trimmed = question.trim()
    if (!trimmed || sending) return

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: trimmed, timestamp: Date.now() }])
    setInput('')
    setSending(true)

    try {
      const data = await api.post('/chat/ask', { question: trimmed, language })
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          text: data.answer,
          confidence: data.confidence,
          recommended: data.recommended || [],
          timestamp: Date.now(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          text: `Sorry, something went wrong: ${err.message}`,
          confidence: 0,
          recommended: [],
          timestamp: Date.now(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendQuestion(input)
  }

  const handleMicClick = () => {
    if (listening) {
      stop()
    } else {
      start()
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 py-6 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Chat with CampusConnect</h1>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="h-9 w-[140px] rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <Card className="mb-3 flex-1 overflow-y-auto rounded-2xl border-border p-4 shadow-[0_20px_60px_rgba(83,127,190,0.10)]">
        {messages.length === 0 && (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">
              Ask me anything about admissions, exams, fees, or campus life. Try one of these:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                  onClick={() => sendQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onChipClick={sendQuestion} />
        ))}

        {sending && (
          <div className="mb-4 flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground shadow-sm">
              CampusConnect is typing…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder={listening ? 'Listening…' : 'Type your question…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        {supported && (
          <Button
            type="button"
            variant={listening ? 'destructive' : 'outline'}
            size="icon"
            onClick={handleMicClick}
            aria-pressed={listening}
            title={listening ? 'Stop listening' : 'Start voice input'}
          >
            {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </Button>
        )}
        <Button type="submit" disabled={sending || !input.trim()} className="gap-2">
          <Send className="size-4" />
          Send
        </Button>
      </form>
    </div>
  )
}
