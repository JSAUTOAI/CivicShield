"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Scale,
  Shield,
  TrendingUp,
  Users,
  Banknote,
  Upload,
  ExternalLink,
} from "lucide-react"

// Reuse the types from the parent page
interface CaseComplaint {
  id: number
  status: string
  complaintText: string
  sentAt: string | null
  respondedAt: string | null
  responseText: string | null
  recipientOrg: string | null
  recipientName: string | null
  recipientEmail: string | null
}

interface CaseAnalysis {
  id: number
  relevantLaws: unknown[]
  rightViolations: unknown[]
  recommendedActions: unknown[]
  precedents: unknown[]
}

interface CaseEvidence {
  id: number
  evidenceType: string
  fileName: string | null
  description: string | null
  verificationStatus: string
}

interface CaseIssue {
  id: number
  issueType: string
  issueCategory?: string
  organization: string
  description: string
  dateOfIncident?: string
  timeOfIncident?: string | null
  location?: string
  status?: string
  complaints: CaseComplaint[]
  legalAnalysis?: CaseAnalysis[]
  evidenceItems?: CaseEvidence[]
}

interface CaseTask {
  id: number
  taskCategory: string
  taskTitle: string
  taskDescription: string | null
  priority: string
  deadline: string | null
  isCompleted: boolean
  completedDate: string | null
}

interface CaseTimelineEvent {
  id: number
  eventType: string
  eventTitle: string
  eventDescription: string | null
  eventDate: string
  importance: string
  isDeadline: boolean
  isCompleted: boolean
}

interface CaseViolation {
  id: number
  violationType: string
  description: string
  severity: string
  legislationBreach: string | null
  proofStrength: string
  remedySought: string | null
}

interface CasePrecedent {
  id: number
  caseName: string
  caseReference: string
  court: string
  keyPrinciple: string
  relevanceToCase: string
  precedentStrength: string
  isBinding: boolean
  caseUrl: string | null
}

interface CaseLegislation {
  id: number
  actTitle: string
  actYear: number | null
  relevantProvisions: string | null
  applicationToCase: string | null
  url: string | null
}

interface CaseData {
  id: number
  caseTitle: string
  caseNumber: string | null
  caseType: string
  courtLevel: string | null
  courtName: string | null
  caseStatus: string
  filedDate: string | null
  hearingDate: string | null
  caseOutcome: string | null
  outcomeDetails: string | null
  legalRepresentation: string
  estimatedCosts: number | null
  actualCosts: number | null
  caseStrength: number
  createdAt: string
  updatedAt: string
  issue: CaseIssue
  courtDocuments: Array<{ id: number }>
  caseTimeline: CaseTimelineEvent[]
  casePreparationTasks: CaseTask[]
  legalPrecedents: CasePrecedent[]
  relevantLegislation: CaseLegislation[]
  rightsViolations: CaseViolation[]
}

type TabId = "overview" | "evidence" | "timeline" | "documents" | "tasks" | "precedents" | "legislation" | "violations"

interface CaseOverviewProps {
  caseData: CaseData
  caseId: string
  onTabSwitch: (tab: TabId) => void
  onToggleTask: (taskId: number, isCompleted: boolean) => void
}

const severityColors: Record<string, string> = {
  low: "default",
  medium: "warning",
  high: "destructive",
}

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
}

function strengthColor(strength: number): string {
  if (strength >= 7) return "bg-emerald-500"
  if (strength >= 4) return "bg-amber-500"
  return "bg-red-500"
}

function daysBetween(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function CaseOverview({ caseData, caseId, onTabSwitch, onToggleTask }: CaseOverviewProps) {
  const [expandedResponse, setExpandedResponse] = React.useState(false)

  const completedTasks = caseData.casePreparationTasks.filter((t) => t.isCompleted).length
  const totalTasks = caseData.casePreparationTasks.length
  const latestComplaint = caseData.issue.complaints?.[0]
  const latestAnalysis = caseData.issue.legalAnalysis?.[0]
  const evidenceItems = caseData.issue.evidenceItems || []
  const highestSeverity = caseData.rightsViolations.reduce((max, v) => {
    const order: Record<string, number> = { high: 3, medium: 2, low: 1 }
    return (order[v.severity] || 0) > (order[max] || 0) ? v.severity : max
  }, "low")

  // Build chronology from multiple sources
  const chronology: Array<{ date: string; label: string; type: string }> = []

  if (caseData.issue.dateOfIncident) {
    chronology.push({ date: caseData.issue.dateOfIncident, label: "Incident occurred", type: "incident" })
  }
  chronology.push({ date: caseData.createdAt, label: "Case opened", type: "case" })
  if (latestComplaint?.sentAt) {
    chronology.push({ date: latestComplaint.sentAt, label: "Complaint sent", type: "sent" })
  }
  if (latestComplaint?.respondedAt) {
    chronology.push({ date: latestComplaint.respondedAt, label: "Response received", type: "response" })
  }
  // Add high-importance timeline events
  caseData.caseTimeline
    .filter((e) => e.importance === "high" || e.isDeadline)
    .slice(0, 3)
    .forEach((e) => {
      chronology.push({ date: e.eventDate, label: e.eventTitle, type: e.isDeadline ? "deadline" : "event" })
    })

  chronology.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Incomplete tasks sorted by priority
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const pendingTasks = caseData.casePreparationTasks
    .filter((t) => !t.isCompleted)
    .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
    .slice(0, 4)

  // Remedies from violations
  const remedies = caseData.rightsViolations
    .map((v) => v.remedySought)
    .filter(Boolean) as string[]

  return (
    <div className="space-y-4">
      {/* Section 1: Quick Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{caseData.caseStrength}/10</p>
            <p className="text-xs text-muted-foreground">Case Strength</p>
            <div className="flex justify-center mt-2 gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={cn("h-2 w-4 rounded-sm", i < caseData.caseStrength ? strengthColor(caseData.caseStrength) : "bg-muted")} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{completedTasks}/{totalTasks}</p>
            <p className="text-xs text-muted-foreground">Tasks Complete</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : "0%" }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{caseData.rightsViolations.length}</p>
            <p className="text-xs text-muted-foreground">Violations</p>
            {caseData.rightsViolations.length > 0 && (
              <Badge variant={severityColors[highestSeverity] as "default" | "warning" | "destructive"} className="mt-2 text-[10px]">
                {highestSeverity} severity
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {caseData.hearingDate ? (
              <>
                <p className={cn("text-2xl font-bold", daysUntil(caseData.hearingDate) <= 7 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                  {daysUntil(caseData.hearingDate)}
                </p>
                <p className="text-xs text-muted-foreground">Days to Hearing</p>
              </>
            ) : caseData.issue.dateOfIncident ? (
              <>
                <p className="text-2xl font-bold text-foreground">{daysBetween(caseData.issue.dateOfIncident)}</p>
                <p className="text-xs text-muted-foreground">Days Since Incident</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">{caseData.caseTimeline.length}</p>
                <p className="text-xs text-muted-foreground">Timeline Events</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Case Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Case Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Against:</span>
                <span className="font-medium text-foreground">{caseData.issue.organization}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Scale className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium text-foreground">{caseData.issue.issueType}</span>
              </div>
              {caseData.issue.issueCategory && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground">{caseData.issue.issueCategory}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {caseData.issue.dateOfIncident && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Incident:</span>
                  <span className="font-medium text-foreground">
                    {new Date(caseData.issue.dateOfIncident).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    {caseData.issue.timeOfIncident ? ` at ${caseData.issue.timeOfIncident}` : ""}
                  </span>
                </div>
              )}
              {caseData.issue.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">{caseData.issue.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm text-foreground leading-relaxed">{caseData.issue.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Key Chronology */}
      {chronology.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Key Chronology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l-2 border-border space-y-4">
              {chronology.map((item, i) => {
                const isPast = new Date(item.date) <= new Date()
                return (
                  <div key={i} className="relative">
                    <div className={cn(
                      "absolute -left-[25px] h-3 w-3 rounded-full border-2 border-background",
                      item.type === "deadline" ? "bg-red-500" :
                      item.type === "response" ? "bg-emerald-500" :
                      item.type === "sent" ? "bg-blue-500" :
                      isPast ? "bg-brand-500" : "bg-muted-foreground"
                    )} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      {item.type === "deadline" && (
                        <Badge variant="destructive" className="text-[10px]">Deadline</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4 & 5: Complaint Status + Violations (side by side) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Section 4: Complaint Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Complaint Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestComplaint ? (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant={
                    latestComplaint.status === "sent" ? "info" :
                    latestComplaint.status === "responded" ? "success" :
                    "default"
                  }>
                    {latestComplaint.status === "responded" ? "Response Received" :
                     latestComplaint.status === "sent" ? "Sent" : "Draft"}
                  </Badge>
                  {latestComplaint.sentAt && (
                    <span className="text-xs text-muted-foreground">
                      Sent {new Date(latestComplaint.sentAt).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>
                {latestComplaint.recipientOrg && (
                  <p className="text-xs text-muted-foreground">
                    To: {latestComplaint.recipientName ? `${latestComplaint.recipientName}, ` : ""}
                    {latestComplaint.recipientOrg}
                    {latestComplaint.recipientEmail ? ` (${latestComplaint.recipientEmail})` : ""}
                  </p>
                )}
                {latestComplaint.respondedAt && latestComplaint.responseText && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Response received {new Date(latestComplaint.respondedAt).toLocaleDateString("en-GB")}:</p>
                    <p className={cn("text-xs text-foreground leading-relaxed", !expandedResponse && "line-clamp-3")}>
                      {latestComplaint.responseText}
                    </p>
                    {latestComplaint.responseText.length > 200 && (
                      <button
                        onClick={() => setExpandedResponse(!expandedResponse)}
                        className="text-xs text-brand-600 hover:underline mt-1"
                      >
                        {expandedResponse ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
                <Link href={`/issues/${caseData.issue.id}?from=case&caseId=${caseId}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 w-full mt-1">
                    <FileText className="h-3.5 w-3.5" /> View Issue & Complaint
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No complaint generated yet</p>
                <Link href={`/issues/${caseData.issue.id}?from=case&caseId=${caseId}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 mt-2">
                    <FileText className="h-3.5 w-3.5" /> Go to Issue
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Rights Violations Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                Rights Violations
              </CardTitle>
              {caseData.rightsViolations.length > 4 && (
                <button onClick={() => onTabSwitch("violations")} className="text-xs text-brand-600 hover:underline">
                  View All ({caseData.rightsViolations.length})
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {caseData.rightsViolations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No violations recorded</p>
            ) : (
              <div className="space-y-2">
                {caseData.rightsViolations.slice(0, 4).map((v) => (
                  <div key={v.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.violationType.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{v.description}</p>
                    </div>
                    <Badge variant={severityColors[v.severity] as "default" | "warning" | "destructive"} className="text-[10px] flex-shrink-0">
                      {v.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 6: Legal Framework */}
      {(caseData.relevantLegislation.length > 0 || caseData.legalPrecedents.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Legal Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Legislation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Legislation</h4>
                  {caseData.relevantLegislation.length > 3 && (
                    <button onClick={() => onTabSwitch("legislation")} className="text-xs text-brand-600 hover:underline">
                      View All ({caseData.relevantLegislation.length})
                    </button>
                  )}
                </div>
                {caseData.relevantLegislation.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No legislation linked</p>
                ) : (
                  <div className="space-y-2">
                    {caseData.relevantLegislation.slice(0, 3).map((l) => (
                      <div key={l.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                          <p className="text-sm font-medium text-foreground">
                            {l.actTitle}{l.actYear ? ` (${l.actYear})` : ""}
                          </p>
                        </div>
                        {l.relevantProvisions && (
                          <p className="text-xs text-muted-foreground line-clamp-2 ml-5.5">{l.relevantProvisions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Precedents */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Precedents</h4>
                  {caseData.legalPrecedents.length > 3 && (
                    <button onClick={() => onTabSwitch("precedents")} className="text-xs text-brand-600 hover:underline">
                      View All ({caseData.legalPrecedents.length})
                    </button>
                  )}
                </div>
                {caseData.legalPrecedents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No precedents linked</p>
                ) : (
                  <div className="space-y-2">
                    {caseData.legalPrecedents.slice(0, 3).map((p) => (
                      <div key={p.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground leading-tight">{p.caseName}</p>
                          {p.isBinding && <Badge variant="brand" className="text-[10px] flex-shrink-0">Binding</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.court}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{p.keyPrinciple}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 7 & 8: Evidence Status + Next Steps (side by side) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Section 7: Evidence Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Evidence Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evidenceItems.length === 0 ? (
              <div className="text-center py-4">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No evidence uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Strong evidence significantly strengthens your case
                </p>
                <Button variant="outline" size="sm" className="gap-1.5 mt-3" onClick={() => onTabSwitch("evidence")}>
                  <Upload className="h-3.5 w-3.5" /> Upload Evidence
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{evidenceItems.length} item{evidenceItems.length !== 1 ? "s" : ""}</p>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onTabSwitch("evidence")}>
                    Manage
                  </Button>
                </div>
                <div className="space-y-1">
                  {evidenceItems.slice(0, 4).map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
                      <span className="text-xs text-foreground truncate">{e.fileName || e.evidenceType}</span>
                      <Badge variant={e.verificationStatus === "verified" ? "success" : "default"} className="text-[10px] flex-shrink-0">
                        {e.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                  {evidenceItems.length > 4 && (
                    <button onClick={() => onTabSwitch("evidence")} className="text-xs text-brand-600 hover:underline w-full text-center mt-1">
                      +{evidenceItems.length - 4} more items
                    </button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 8: Next Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                Next Steps
              </CardTitle>
              {totalTasks > 4 && (
                <button onClick={() => onTabSwitch("tasks")} className="text-xs text-brand-600 hover:underline">
                  View All ({totalTasks})
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-4">
                <Check className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
                <p className="text-sm text-muted-foreground">All tasks completed</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const isOverdue = task.deadline && new Date(task.deadline) < new Date()
                  return (
                    <div key={task.id} className={cn("flex items-start gap-2.5 rounded-lg border p-3", isOverdue ? "border-red-300 dark:border-red-800" : "border-border")}>
                      <button
                        onClick={() => onToggleTask(task.id, true)}
                        className="mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-border hover:border-brand-500 transition-colors flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{task.taskTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[10px] font-medium", priorityColors[task.priority])}>{task.priority}</span>
                          {task.deadline && (
                            <span className={cn("text-[10px] flex items-center gap-1", isOverdue ? "text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground")}>
                              <Calendar className="h-3 w-3" />
                              {isOverdue ? "Overdue — " : ""}{new Date(task.deadline).toLocaleDateString("en-GB")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 9: Financial Summary */}
      {(caseData.estimatedCosts || caseData.actualCosts || remedies.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Banknote className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {caseData.estimatedCosts != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Costs</p>
                  <p className="text-lg font-bold text-foreground">£{caseData.estimatedCosts.toLocaleString()}</p>
                </div>
              )}
              {caseData.actualCosts != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Actual Costs</p>
                  <p className="text-lg font-bold text-foreground">£{caseData.actualCosts.toLocaleString()}</p>
                </div>
              )}
              {remedies.length > 0 && (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground mb-1">Remedies Sought</p>
                  <div className="space-y-1">
                    {remedies.slice(0, 3).map((r, i) => (
                      <p key={i} className="text-xs text-foreground">{r}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 10: Case Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Case Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {caseData.caseNumber && (
              <div>
                <p className="text-xs text-muted-foreground">Case Number</p>
                <p className="font-medium text-foreground">{caseData.caseNumber}</p>
              </div>
            )}
            {caseData.courtLevel && (
              <div>
                <p className="text-xs text-muted-foreground">Court Level</p>
                <p className="font-medium text-foreground">{caseData.courtLevel}</p>
              </div>
            )}
            {caseData.courtName && (
              <div>
                <p className="text-xs text-muted-foreground">Court</p>
                <p className="font-medium text-foreground">{caseData.courtName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Representation</p>
              <p className="font-medium text-foreground">{caseData.legalRepresentation}</p>
            </div>
            {caseData.hearingDate && (
              <div>
                <p className="text-xs text-muted-foreground">Hearing Date</p>
                <p className="font-medium text-foreground">{new Date(caseData.hearingDate).toLocaleDateString("en-GB")}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Case Opened</p>
              <p className="font-medium text-foreground">{new Date(caseData.createdAt).toLocaleDateString("en-GB")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
