import { GraduationCap, MessageCircleQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Card, CardContent } from '../components/ui/card.jsx'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <Card className="rounded-2xl border-border shadow-[0_20px_60px_rgba(83,127,190,0.14)]">
        <CardContent className="flex flex-col items-center gap-6 px-6 py-14 text-center sm:px-12">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#246be8] to-[#8150d9] text-white">
            <GraduationCap className="size-8" />
          </span>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Welcome to CampusConnect
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Your college enquiry assistant. Ask questions, browse FAQs, and stay up to date with the
            latest announcements.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/chat">
              <MessageCircleQuestion className="size-4" />
              Ask a question
            </Link>
          </Button>
          <div className="flex gap-6 text-sm">
            <Link to="/faq" className="text-muted-foreground transition-colors hover:text-primary">
              Browse FAQ
            </Link>
            <Link to="/announcements" className="text-muted-foreground transition-colors hover:text-primary">
              See Announcements
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
