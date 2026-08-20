"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, Send, CheckCircle2, Mail } from "lucide-react"

/**
 * Support contact form.
 *
 * Posts to /api/support, which stores the message and emails support@.
 * The mailto link stays as a fallback for anyone who'd rather use their
 * own mail client, or if this form ever fails.
 */
export function SupportForm() {
  const { data: session } = useSession()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  // Prefill from the session once it loads, without clobbering typing.
  React.useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name)
    if (session?.user?.email && !email) setEmail(session.user.email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Could not send your message")
      setSent(true)
      setSubject("")
      setMessage("")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-10 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Message received</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks — we&apos;ll reply to <span className="font-medium text-foreground">{email}</span>.
          If it&apos;s urgent, you can also email support@civicshield.co.uk directly.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 animate-fade-in">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
          <HelpCircle className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Still need help?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us what&apos;s gone wrong and we&apos;ll get back to you. Real problems from
          real users are how this gets better.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Your name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Your email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. My complaint won't send"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">What&apos;s happened?</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the problem, including what you were doing when it went wrong."
            rows={5}
            required
            maxLength={5000}
          />
          <p className="mt-1 text-xs text-muted-foreground">{message.length}/5000</p>
        </div>

        <Button type="submit" variant="brand" size="lg" className="w-full gap-2" loading={sending}>
          <Send className="h-4 w-4" />
          Send message
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Or email{" "}
          <a href="mailto:support@civicshield.co.uk" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            support@civicshield.co.uk
          </a>{" "}
          directly.
        </p>
      </form>
    </div>
  )
}
