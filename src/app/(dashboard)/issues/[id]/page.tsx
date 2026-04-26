"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useFetch } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState, ErrorState } from "@/components/ui/empty-state"
import type { IssueDetail } from "@/lib/types"
import {
  ArrowLeft,
  Edit,
  History,
  Info,
  AlertTriangle,
  Scale,
  Gavel,
  BookOpen,
  FileText,
  Send,
  Trash2,
  RefreshCw,
  Save,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Shield,
  CheckCircle,
  Copy,
  Loader2,
  Lightbulb,
  X,
} from "lucide-react"

// Types for the JSON stored in legalAnalysis table
interface StoredViolation {
  type: string
  description: string
  legalResponse: string
  severity: string
}

interface StoredPrecedent {
  caseName: string
  caseReference: string
  court: string
  courtLevel: string
  keyPrinciple: string
  relevance: string
  legalDeclaration: string
  isBinding: boolean
  caseUrl?: string
}

interface StoredLegislation {
  actTitle: string
  description: string
  legalDeclaration: string
  relevance?: string
  url?: string
}

interface StoredAction {
  title: string
  description: string
  priority: string
  actionUrl?: string
}

const courtLevelColors: Record<string, string> = {
  "House of Lords": "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
  "Supreme Court": "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
  "High Court": "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
  "Court of Appeal": "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white",
  "Crown Court": "bg-slate-600 text-white dark:bg-slate-500 dark:text-white",
  "Magistrates Court": "bg-gray-600 text-white dark:bg-gray-500 dark:text-white",
}

function SourceLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
    >
      {children}
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </a>
  )
}

export default function IssueDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const issueId = params.id as string
  const fromCase = searchParams.get("from") === "case"
  const caseId = searchParams.get("caseId")
  const { data: response, loading, error, refetch } = useFetch<{ success: boolean; data: IssueDetail }>(`/api/issues/${issueId}`)
  const issue = response?.data || (response as unknown as IssueDetail)
  const [complaintText, setComplaintText] = React.useState("")
  const [analyzing, setAnalyzing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [showSendConfirm, setShowSendConfirm] = React.useState(false)
  const [truthChecked, setTruthChecked] = React.useState(false)
  const [creatingCase, setCreatingCase] = React.useState(false)
  const [recipientName, setRecipientName] = React.useState("")
  const [recipientOrg, setRecipientOrg] = React.useState("")
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [recipientAddress, setRecipientAddress] = React.useState("")
  const [recipientExpanded, setRecipientExpanded] = React.useState(false)
  const [savingRecipient, setSavingRecipient] = React.useState(false)
  const [showBodyHint, setShowBodyHint] = React.useState(false)
  const autoExpandedRef = React.useRef(false)

  // Get the latest analysis and complaint
  const latestAnalysis = issue?.legalAnalysis?.[0]
  const latestComplaint = issue?.complaints?.[0]
  const legalCases = (issue as unknown as { legalCases?: { id: number }[] })?.legalCases || []
  const hasCase = legalCases.length > 0
  const existingCaseId = hasCase ? legalCases[0]?.id : null

  // Parse the stored JSON arrays
  const violations = (latestAnalysis?.rightViolations || []) as unknown as StoredViolation[]
  const precedents = (latestAnalysis?.precedents || []) as unknown as StoredPrecedent[]
  const legislation = (latestAnalysis?.relevantLaws || []) as unknown as StoredLegislation[]
  const actions = (latestAnalysis?.recommendedActions || []) as unknown as StoredAction[]

  // Sync complaint text when data loads
  React.useEffect(() => {
    if (latestComplaint?.complaintText && !complaintText) {
      setComplaintText(latestComplaint.complaintText)
    }
  }, [latestComplaint, complaintText])

  // Hydrate recipient fields and auto-expand once when email is missing
  React.useEffect(() => {
    if (!latestComplaint) return
    setRecipientName(latestComplaint.recipientName || "")
    setRecipientOrg(latestComplaint.recipientOrg || "")
    setRecipientEmail(latestComplaint.recipientEmail || "")
    setRecipientAddress(latestComplaint.recipientAddress || "")
    if (
      !autoExpandedRef.current &&
      latestComplaint.status === "draft" &&
      !latestComplaint.recipientEmail
    ) {
      setRecipientExpanded(true)
      autoExpandedRef.current = true
    }
  }, [latestComplaint])

  async function handleAnalyze() {
    setAnalyzing(true)
    try {
      const res = await fetch(`/api/issues/${issueId}/analyze`, { method: "POST" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed" }))
        if (body.retryExhausted) {
          toast.error("AI servers are currently experiencing delays. Please try again in a few minutes.")
        } else {
          throw new Error(body.error || "Analysis failed")
        }
        return
      }
      toast.success("Analysis complete! Complaint generated.")
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSaveComplaint() {
    if (!latestComplaint) return
    setSaving(true)
    try {
      const res = await fetch(`/api/complaints/${latestComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintText }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Complaint saved")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveRecipient() {
    if (!latestComplaint) return
    const trimmedEmail = recipientEmail.trim()
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address")
      return
    }
    // Only send keys with non-empty values — server schema rejects empty strings
    // for recipientEmail (z.string().email()) and only writes truthy values anyway.
    const payload: Record<string, string> = {}
    if (recipientName.trim()) payload.recipientName = recipientName.trim()
    if (recipientOrg.trim()) payload.recipientOrg = recipientOrg.trim()
    if (trimmedEmail) payload.recipientEmail = trimmedEmail
    if (recipientAddress.trim()) payload.recipientAddress = recipientAddress.trim()
    if (Object.keys(payload).length === 0) {
      toast.error("Please fill in at least one recipient field")
      return
    }
    setSavingRecipient(true)
    try {
      const res = await fetch(`/api/complaints/${latestComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed" }))
        throw new Error(body.error || "Failed to save recipient")
      }
      toast.success("Recipient details saved")
      setRecipientExpanded(false)
      setShowBodyHint(true)
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSavingRecipient(false)
    }
  }

  function handleCancelRecipient() {
    setRecipientName(latestComplaint?.recipientName || "")
    setRecipientOrg(latestComplaint?.recipientOrg || "")
    setRecipientEmail(latestComplaint?.recipientEmail || "")
    setRecipientAddress(latestComplaint?.recipientAddress || "")
    setRecipientExpanded(false)
  }

  async function handleSendComplaint() {
    if (!latestComplaint) return
    setSaving(true)
    try {
      // Save any edits first
      await fetch(`/api/complaints/${latestComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintText }),
      })
      // Then mark as sent with truth confirmed
      const res = await fetch(`/api/complaints/${latestComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent", truthConfirmed: true }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed" }))
        throw new Error(body.error || "Failed to send")
      }
      toast.success("Complaint sent successfully")
      setShowSendConfirm(false)
      setTruthChecked(false)
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleOpenCase() {
    setCreatingCase(true)
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: parseInt(issueId),
          caseTitle: `${issue.issueType} — ${issue.organization}`,
          caseType: "administrative",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create case")
      toast.success("Case created — redirecting...")
      window.location.href = `/cases/${data.id || data.data?.id}`
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setCreatingCase(false)
    }
  }

  async function handleCopyComplaint() {
    try {
      await navigator.clipboard.writeText(complaintText)
      toast.success("Complaint copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  async function handleDeleteComplaint() {
    if (!latestComplaint || !confirm("Delete this complaint?")) return
    try {
      await fetch(`/api/complaints/${latestComplaint.id}`, { method: "DELETE" })
      toast.success("Complaint deleted")
      refetch()
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10"><PageSkeleton rows={4} /></div>
  if (error) return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>
  if (!issue) return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorState message="Issue not found" /></div>

  // If no analysis yet, show the analyze button
  const hasAnalysis = latestAnalysis && violations.length > 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <Link
          href={fromCase && caseId ? `/cases/${caseId}` : "/issues"}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {fromCase && caseId ? "Back to Case" : ""}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {hasAnalysis ? "Legal Analysis" : "Issue Details"}
        </h1>
      </div>

      {/* Issue Summary */}
      <Card className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Issue Summary</h2>
              <p className="text-xs text-muted-foreground">
                {issue.issueType} Issue #{issue.id}
              </p>
            </div>
            <Badge variant={issue.status === "resolved" ? "success" : "warning"}>
              {issue.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                  Issue Details
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {issue.description}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">
                  Authority Involved
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{issue.organization}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {issue.dateOfIncident}{issue.timeOfIncident ? ` at ${issue.timeOfIncident}` : ""} — {issue.location}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Analysis Yet */}
      {!hasAnalysis && (
        <Card className="mb-6">
          <CardContent className="p-8">
            <EmptyState
              icon={Scale}
              title="No analysis yet"
              description="Run AI analysis to identify your rights, find legal precedents, and generate a formal complaint letter."
              actionLabel={analyzing ? "Analysing..." : "Run AI Analysis"}
              onAction={analyzing ? undefined : handleAnalyze}
            />
            {analyzing && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing your issue against UK law...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {hasAnalysis && (
        <>
          {/* Rights Violations */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-bold text-foreground">
                Rights Violations
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {violations.map((violation) => (
                <Card
                  key={violation.type}
                  className="border-red-300 dark:border-red-800/50"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/60">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-300" />
                      </span>
                      <h4 className="text-sm font-bold text-red-700 dark:text-red-200">
                        {violation.type}
                      </h4>
                    </div>
                    <p className="mb-3 text-sm text-foreground leading-relaxed">
                      {violation.description}
                    </p>
                    <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/50">
                      <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                        Legal Response:
                      </p>
                      <p className="text-xs italic text-foreground leading-relaxed">
                        {violation.legalResponse}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Legal Precedents & Case Law */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-lg font-bold text-foreground">
                Legal Precedents & Case Law
              </h3>
            </div>

            <Card className="mb-4 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                  Legal Framework:
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  These precedents establish the legal framework protecting your
                  rights. Citing these cases in communications with authorities
                  significantly strengthens your position.
                </p>
              </CardContent>
            </Card>

            {/* Featured first precedent */}
            {precedents.length > 0 && (
              <Card className="mb-4 card-hover">
                <CardContent className="p-6">
                  <h4 className="mb-2 text-base font-bold text-brand-700 dark:text-brand-400">
                    <SourceLink href={precedents[0].caseUrl}>{precedents[0].caseName}</SourceLink>
                  </h4>
                  <p className="mb-4 text-sm text-foreground leading-relaxed">
                    {precedents[0].keyPrinciple}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Key Principle</p>
                      <p className="text-xs text-foreground">{precedents[0].relevance}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Jurisdiction</p>
                      <p className="text-xs text-foreground">{precedents[0].court}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted p-3">
                    <p className="text-xs font-semibold text-foreground mb-1">Legal Declaration Template</p>
                    <p className="text-xs italic text-foreground">
                      {precedents[0].legalDeclaration}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {precedents.slice(1).map((precedent) => (
                <Card key={precedent.caseReference} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-foreground leading-tight">
                        <SourceLink href={precedent.caseUrl}>{precedent.caseName}</SourceLink>
                      </h4>
                      {courtLevelColors[precedent.courtLevel] && (
                        <span
                          className={cn(
                            "ml-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm",
                            courtLevelColors[precedent.courtLevel]
                          )}
                        >
                          {precedent.courtLevel}
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-xs text-foreground leading-relaxed">
                      {precedent.keyPrinciple}
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="font-semibold text-foreground">Citation: </span>
                        <span className="text-foreground">{precedent.caseReference}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Legal Response: </span>
                        <span className="italic text-foreground">
                          {precedent.legalDeclaration}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Relevant Legislation */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-lg font-bold text-foreground">
                Relevant Legislation
              </h3>
            </div>

            <Card className="mb-4 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Legal Protection Statement:
                </p>
                <p className="text-sm italic text-foreground leading-relaxed">
                  &ldquo;I am aware of my rights under the following legislation and
                  hereby invoke these protections. I request that you proceed in
                  accordance with these laws and respect my rights as a living
                  man/woman.&rdquo;
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {legislation.map((leg) => (
                <Card key={leg.actTitle} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-800/50">
                        <BookOpen className="h-4 w-4 text-brand-600 dark:text-brand-300" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        <SourceLink href={leg.url}>{leg.actTitle}</SourceLink>
                      </h4>
                    </div>
                    <p className="mb-3 text-sm text-foreground leading-relaxed">
                      {leg.description}
                    </p>
                    <div className="rounded-lg border border-border bg-muted p-3">
                      <p className="text-xs font-semibold text-foreground mb-1">Legal Declaration:</p>
                      <p className="text-xs italic text-foreground">
                        {leg.legalDeclaration}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Open Case Button */}
          {latestAnalysis && (
            <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
              {hasCase ? (
                <Link href={`/cases/${existingCaseId}`}>
                  <Button variant="outline" className="w-full gap-2 py-6 text-base">
                    <Briefcase className="h-5 w-5" />
                    View Case Manager
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="brand"
                  className="w-full gap-2 py-6 text-base"
                  onClick={handleOpenCase}
                  disabled={creatingCase}
                >
                  {creatingCase ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Creating Case...</>
                  ) : (
                    <><Briefcase className="h-5 w-5" /> Open Case Manager</>
                  )}
                </Button>
              )}
            </section>
          )}

          {/* Complaint Template */}
          {latestComplaint && (
            <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          Your Complaint
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {latestComplaint.status === "sent"
                            ? `Sent on ${new Date(latestComplaint.sentAt!).toLocaleDateString("en-GB")}`
                            : "Draft — edit and send when ready"}
                        </p>
                      </div>
                      {latestComplaint.status === "sent" && (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Sent
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons — wrap on mobile */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopyComplaint}>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Copy</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleDeleteComplaint}>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleAnalyze} disabled={analyzing}>
                        <RefreshCw className={cn("h-3.5 w-3.5", analyzing && "animate-spin")} />
                        <span className="hidden sm:inline">Regenerate</span>
                      </Button>
                      {latestComplaint.status === "draft" && (
                        <>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSaveComplaint} disabled={saving}>
                            <Save className="h-3.5 w-3.5" />
                            Save
                          </Button>
                          <Button variant="brand" size="sm" className="gap-1.5" onClick={() => { setShowSendConfirm(true); setTruthChecked(false) }} disabled={saving}>
                            <Send className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Send Complaint</span>
                            <span className="sm:hidden">Send</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recipient block — collapsible editor */}
                  <div className="mb-4 space-y-2">
                    {latestComplaint.status === "draft" && !latestComplaint.recipientEmail && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          <strong>No recipient email yet.</strong> Add one below so we can send by email — without it, sending falls back to manual.
                        </span>
                      </div>
                    )}

                    {!recipientExpanded && (
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold">To: </span>
                          {latestComplaint.recipientName && `${latestComplaint.recipientName}, `}
                          {latestComplaint.recipientOrg || (
                            <span className="italic text-muted-foreground">recipient not set</span>
                          )}
                          {latestComplaint.recipientEmail && ` (${latestComplaint.recipientEmail})`}
                        </div>
                        {latestComplaint.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 flex-shrink-0 gap-1.5 px-2 text-xs"
                            onClick={() => setRecipientExpanded(true)}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        )}
                      </div>
                    )}

                    {recipientExpanded && latestComplaint.status === "draft" && (
                      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground">Recipient details</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={handleCancelRecipient}
                            disabled={savingRecipient}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Recipient name
                            </label>
                            <Input
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              placeholder="e.g. Complaints Manager"
                              disabled={savingRecipient}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Organisation
                            </label>
                            <Input
                              value={recipientOrg}
                              onChange={(e) => setRecipientOrg(e.target.value)}
                              placeholder="e.g. Acme Ltd"
                              disabled={savingRecipient}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Email
                            </label>
                            <Input
                              type="email"
                              value={recipientEmail}
                              onChange={(e) => setRecipientEmail(e.target.value)}
                              placeholder="complaints@example.com"
                              disabled={savingRecipient}
                            />
                            {!recipientEmail && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Without an email, the complaint will be marked as manually sent rather than emailed.
                              </p>
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Postal address
                            </label>
                            <Input
                              value={recipientAddress}
                              onChange={(e) => setRecipientAddress(e.target.value)}
                              placeholder="Full postal address (optional)"
                              disabled={savingRecipient}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelRecipient}
                            disabled={savingRecipient}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="brand"
                            size="sm"
                            className="gap-1.5"
                            onClick={handleSaveRecipient}
                            disabled={savingRecipient}
                          >
                            {savingRecipient ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            Save recipient
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {showBodyHint && latestComplaint.status === "draft" && (
                    <div className="mb-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        You&apos;ve updated the recipient — review the letter body below and update the addressee block if needed.
                      </span>
                    </div>
                  )}

                  <textarea
                    value={complaintText}
                    onChange={(e) => {
                      setComplaintText(e.target.value)
                      if (showBodyHint) setShowBodyHint(false)
                    }}
                    readOnly={latestComplaint.status === "sent"}
                    className="w-full min-h-[400px] rounded-lg border border-border bg-muted/30 p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y disabled:opacity-50"
                  />
                </CardContent>
              </Card>
            </section>
          )}

          {/* Recommended Actions */}
          {actions.length > 0 && (
            <section className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Recommended Actions
                </h3>
                <p className="text-xs text-muted-foreground">
                  Steps you can take based on this analysis
                </p>
              </div>

              <div className="space-y-3">
                {actions.map((action) => (
                  <Card
                    key={action.title}
                    className={cn(
                      "card-hover",
                      action.priority === "primary" && "border-emerald-200 dark:border-emerald-900/30"
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        {action.priority === "primary" ? (
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                        ) : (
                          <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                        )}
                        <div>
                          <h4
                            className={cn(
                              "text-sm font-semibold",
                              action.priority === "primary"
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-foreground"
                            )}
                          >
                            <SourceLink href={action.actionUrl}>{action.title}</SourceLink>
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Statement of Truth Modal */}
      {showSendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Confirm & Send</h3>
              </div>
              <button
                onClick={() => { setShowSendConfirm(false); setTruthChecked(false) }}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/10">
              <p className="text-sm text-foreground leading-relaxed">
                This complaint will be sent via email to the recipient on your behalf.
                Please ensure you have read the complaint in full and verified all
                information, including legislation and case law references.
              </p>
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
                onClick={() => { setShowSendConfirm(false); setTruthChecked(false) }}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                size="sm"
                className="gap-1.5"
                disabled={!truthChecked || saving}
                onClick={handleSendComplaint}
              >
                {saving ? (
                  <>Sending...</>
                ) : (
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
