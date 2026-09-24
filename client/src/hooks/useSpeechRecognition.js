import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeechRecognition() {
  const RecognitionCtor =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const supported = Boolean(RecognitionCtor)

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!supported) return undefined

    const recognition = new RecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let text = ''
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [supported, RecognitionCtor])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript('')
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      // ignore double-start errors
    }
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setListening(false)
  }, [])

  return { supported, listening, transcript, start, stop }
}

export default useSpeechRecognition
