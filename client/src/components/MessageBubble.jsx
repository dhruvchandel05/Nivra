import ConfidenceBadge from './ConfidenceBadge.jsx'

export default function MessageBubble({ message, onChipClick }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[75%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm whitespace-pre-wrap'
              : 'rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-sm text-card-foreground shadow-sm whitespace-pre-wrap'
          }
          title={message.timestamp ? new Date(message.timestamp).toLocaleString() : undefined}
        >
          {message.text}
        </div>

        {!isUser && typeof message.confidence === 'number' && (
          <div className="mt-2">
            <ConfidenceBadge confidence={message.confidence} />
          </div>
        )}

        {!isUser && Array.isArray(message.recommended) && message.recommended.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.recommended.map((rec) => (
              <button
                key={rec.id}
                type="button"
                className="rounded-full border border-border bg-background px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                onClick={() => onChipClick && onChipClick(rec.question)}
              >
                {rec.question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
