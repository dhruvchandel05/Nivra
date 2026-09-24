import { Badge } from './ui/badge.jsx'

export default function ConfidenceBadge({ confidence }) {
  const pct = Math.round((confidence || 0) * 100)
  let variant = 'destructive'
  let label = 'Low confidence'

  if (confidence >= 0.7) {
    variant = 'success'
    label = 'High confidence'
  } else if (confidence >= 0.4) {
    variant = 'warning'
    label = 'Medium confidence'
  }

  return (
    <Badge variant={variant}>
      {label} · {pct}%
    </Badge>
  )
}
