"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useFetch } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/empty-state"
import type { ComplaintWithIssue } from "@/lib/types"
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  FileText,
  Mail,
  MailOpen,
  MapPin,
  Send,
  Trash2,
  User,
  Building2,
  AlertTriangle,
  X,
  ExternalLink,
  MessageSquare,
  Pencil,
  Users,
} from "lucide-react"

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type TimelineStep = {
  label: string
  date: string | null
  status: "complete" | "active" | "pending"
  icon: React.ComponentType<{ className?: string }>
  detail?: string
}

function getTimelineSteps(complaint: ComplaintWithIssue): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      label: "Complaint Created",
      date: complaint.createdAt,
      status: "complete",
      icon: FileText,
    },
  ]

  if (complaint.status === "draft") {
    steps.push({
      label: "Ready to Send",
      date: null,
      status: "active",
      icon: Send,
      detail: "Review your complaint and send when ready",
    })
    return steps
  }

  // Sent complaint
  steps.push({
    label: "Complaint Sent",
    date: complaint.sentAt,
    status: "complete",
    icon: Mail,
    detail: complaint.sentVia === "email" ? "Sent via email" : "Sent manually",
  })

  if (complaint.openedAt) {
    steps.push({
      label: "Complaint Opened",
      date: complaint.openedAt,
      status: "complete",
      icon: MailOpen,
      detail: "Recipient opened the email",
    })
  }

  if (complaint.respondedAt) {
    steps.push({
      label: "Response Received",
      date: complaint.respondedAt,
      status: "complete",
      icon: MessageSquare,
    })
  } else {
    steps.push({
      label: "Awaiting Response",
      date: null,
      status: "active",
      icon: Clock,
      detail: "Organisations should acknowledge within 14 days and respond fully within 28 days",
    })
  }

  return steps
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: complaint, loading, error, refetch } = useFetch<ComplaintWithIssue>(`/api/complaints/${id}`)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [sendModalOpen, setSendModalOpen] = React.useState(false)
  const [truthChecked, setTruthChecked] = React.useState(false)
  const { data: session } = useSession()
  const [ccSelf, setCcSelf] = React.useState(false)
  const [ccEmail, setCcEmail] = React.useState("")

  React.useEffect(() => {
    if (sendModalOpen && !ccEmail && session?.user?.email) {
      setCcEmail(session.user.email)
    }
  }, [sendModalOpen, session?.user?.email, ccEmail])

  async function handleCopyText() {
    if (!complaint) return
    try {
      await navigator.clipboard.writeText(complaint.complaintText)
      toast.success("Complaint text copied to clipboard")
    } catch {
      toast.error("Failed to copy text")
    }
  }

  async function handleSend() {
    if (!complaint) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "sent",
          truthConfirmed: true,
          userCcEmail: ccSelf && ccEmail ? ccEmail : "",
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed to send" }))
        throw new Error(body.error || "Failed to send complaint")
      }
      toast.success("Complaint sent successfully")
      setSendModalOpen(false)
      setTruthChecked(false)
      setCcSelf(false)
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!complaint) return
    if (!confirm("Are you sure you want to delete this complaint? This cannot be undone.")) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete complaint")
      toast.success("Complaint deleted")
      router.push("/complaints")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10"><PageSkeleton rows={6} /></div>
  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>
  if (!complaint) return <div className="mx-auto max-w-3xl px-4 py-16 text-center"><p className="text-muted-foreground">Complaint not found.</p></div>

  const timeline = getTimelineSteps(complaint)
  const isSent = complaint.status === "sent"
  const paragraphs = complaint.complaintText.split(/\n\n+/).filter(Boolean)

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div>
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All Complaints
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {complaint.issue?.organization || "Unknown Organisation"}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{complaint.issue?.issueType || "Unknown"}</Badge>
              <Badge variant={isSent ? "success" : "default"}>
                {isSent ? "Sent" : "Draft"}
              </Badge>
              {isSent && complaint.openedAt && !complaint.respondedAt && (
                <Badge variant="brand">Opened</Badge>
              )}
              {isSent && complaint.respondedAt && (
                <Badge variant="brand">Response Received</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Created {formatDate(complaint.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Complaint Journey
          </h2>
          <div className="space-y-0">
            {timeline.map((step, i) => {
              const Icon = step.icon
              const isLast = i === timeline.length - 1
              return (
                <div key={step.label} className="flex gap-3">
                  {/* Vertical line + icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        step.status === "complete"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : step.status === "active"
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                            : "border-border bg-muted"
                      )}
                    >
                      {step.status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : step.status === "active" ? (
                        <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 min-h-[24px]",
                          step.status === "complete"
                            ? "bg-emerald-300 dark:bg-emerald-700"
                            : "bg-border"
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("pb-5", isLast && "pb-0")}>
                    <p className={cn(
                      "text-sm font-medium",
                      step.status === "active" && "text-brand-700 dark:text-brand-400"
                    )}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-muted-foreground">{formatDateTime(step.date)}</p>
                    )}
                    {step.detail && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recipient Details */}
      {(complaint.recipientOrg || complaint.recipientName || complaint.recipientEmail) && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Sent To
            </h2>
            <div className="space-y-2">
              {complaint.recipientOrg && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{complaint.recipientOrg}</span>
                </div>
              )}
              {complaint.recipientName && (
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {complaint.recipientName}
                </div>
              )}
              {complaint.recipientEmail && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{complaint.recipientEmail}</span>
                </div>
              )}
              {complaint.recipientAddress && (
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{complaint.recipientAddress}</span>
                </div>
              )}
            </div>

            {/* CC Recipients */}
            {complaint.ccRecipients && complaint.ccRecipients.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Also sent to (CC)
                  </p>
                </div>
                <div className="space-y-1.5">
                  {complaint.ccRecipients.map((cc, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5">
                      <span className="text-xs font-medium">{cc.organization || cc.name}</span>
                      <span className="text-[10px] text-muted-foreground">{cc.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Complaint Text */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {isSent ? "What Was Sent" : "Your Complaint"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleCopyText}
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-5 sm:p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground mb-3 last:mb-0 whitespace-pre-wrap">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Section */}
      {isSent && (
        <Card className={complaint.respondedAt
          ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10"
          : "border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10"
        }>
          <CardContent className="p-5">
            {complaint.respondedAt && complaint.responseText ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-semibold">Response from {complaint.recipientOrg || "the organisation"}</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Received {formatDate(complaint.respondedAt)}
                </p>
                <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-900/30 dark:bg-background">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.responseText}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Awaiting Response
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your complaint was sent to {complaint.recipientOrg || "the organisation"} on {formatDate(complaint.sentAt)}.
                  Under standard complaints procedures, they should acknowledge your complaint within <strong>14 days</strong> and
                  provide a full response within <strong>28 days</strong>.
                </p>
                {complaint.sentAt && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.floor((Date.now() - new Date(complaint.sentAt).getTime()) / (1000 * 60 * 60 * 24))} days since sent
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {!isSent && (
          <>
            <Button
              variant="brand"
              className="gap-2"
              onClick={() => { setSendModalOpen(true); setTruthChecked(false) }}
            >
              <Send className="h-4 w-4" />
              Send Complaint
            </Button>
            <Link href={`/issues/${complaint.issueId}`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Complaint
              </Button>
            </Link>
          </>
        )}

        {isSent && (
          <Link href={`/issues/${complaint.issueId}`}>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Full Legal Analysis
            </Button>
          </Link>
        )}

        <Button
          variant="ghost"
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={actionLoading}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Statement of Truth Modal */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Confirm & Send</h3>
              </div>
              <button
                onClick={() => { setSendModalOpen(false); setTruthChecked(false) }}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/10">
              <p className="text-sm text-foreground leading-relaxed">
                This complaint will be sent via email to <strong>{complaint.recipientOrg || "the recipient"}</strong> on your behalf.
                Please ensure you have read the complaint in full and verified all information.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ccSelf}
                  onChange={(e) => setCcSelf(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border accent-brand-500"
                />
                <span className="text-sm text-foreground leading-relaxed">
                  Also send a copy to my personal email
                  <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
                </span>
              </label>
              {ccSelf && (
                <input
                  type="email"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              )}
            </div>

            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={truthChecked}
                onChange={(e) => setTruthChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-brand-500"
              />
              <span className="text-sm text-foreground leading-relaxed">
                I confirm I have read this complaint in full and believe the information
                to be true and accurate. I understand CivicShield provides tools and
                information, not legal advice.
              </span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSendModalOpen(false); setTruthChecked(false) }}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                size="sm"
                className="gap-1.5"
                disabled={!truthChecked || actionLoading}
                onClick={handleSend}
              >
                {actionLoading ? "Sending..." : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Complaint
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
