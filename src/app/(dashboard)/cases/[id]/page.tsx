"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useFetch } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/empty-state"
import CaseOverview from "./case-overview"
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckSquare,
  Scale,
  BookOpen,
  AlertTriangle,
  Plus,
  Upload,
  Download,
  Trash2,
  Check,
  ChevronRight,
  Calendar,
  Briefcase,
  ExternalLink,
  Loader2,
  Save,
} from "lucide-react"

const TABS = [
  { id: "overview", label: "Overview", icon: Briefcase },
  { id: "evidence", label: "Evidence", icon: Upload },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "precedents", label: "Precedents", icon: Scale },
  { id: "legislation", label: "Legislation", icon: BookOpen },
  { id: "violations", label: "Violations", icon: AlertTriangle },
] as const

type TabId = (typeof TABS)[number]["id"]

interface CaseDetail {
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
  issue: {
    id: number
    issueType: string
    issueCategory?: string
    organization: string
    description: string
    dateOfIncident?: string
    timeOfIncident?: string | null
    location?: string
    status?: string
    complaints: Array<{
      id: number
      status: string
      complaintText: string
      sentAt: string | null
      respondedAt: string | null
      responseText: string | null
      recipientOrg: string | null
      recipientName: string | null
      recipientEmail: string | null
    }>
    legalAnalysis?: Array<{
      id: number
      relevantLaws: unknown[]
      rightViolations: unknown[]
      recommendedActions: unknown[]
      precedents: unknown[]
    }>
    evidenceItems?: Array<{
      id: number
      evidenceType: string
      fileName: string | null
      description: string | null
      verificationStatus: string
    }>
  }
  courtDocuments: Array<{
    id: number
    documentType: string
    documentTitle: string
    documentContent: string | null
    fileUrl: string | null
    filedDate: string | null
    status: string
    createdAt: string
  }>
  caseTimeline: Array<{
    id: number
    eventType: string
    eventTitle: string
    eventDescription: string | null
    eventDate: string
    importance: string
    isDeadline: boolean
    isCompleted: boolean
  }>
  casePreparationTasks: Array<{
    id: number
    taskCategory: string
    taskTitle: string
    taskDescription: string | null
    priority: string
    deadline: string | null
    isCompleted: boolean
    completedDate: string | null
  }>
  legalPrecedents: Array<{
    id: number
    caseName: string
    caseReference: string
    court: string
    keyPrinciple: string
    relevanceToCase: string
    precedentStrength: string
    isBinding: boolean
    caseUrl: string | null
  }>
  relevantLegislation: Array<{
    id: number
    actTitle: string
    actYear: number | null
    relevantProvisions: string | null
    applicationToCase: string | null
    url: string | null
  }>
  rightsViolations: Array<{
    id: number
    violationType: string
    description: string
    severity: string
    legislationBreach: string | null
    proofStrength: string
    remedySought: string | null
  }>
}

const statusColors: Record<string, string> = {
  preparation: "default",
  filed: "info",
  ongoing: "warning",
  appealed: "brand",
  concluded: "success",
}

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
}

const severityColors: Record<string, string> = {
  low: "default",
  medium: "warning",
  high: "destructive",
}

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  const { data: response, loading, error, refetch } = useFetch<CaseDetail>(`/api/cases/${caseId}`)
  const caseData = response
  const [activeTab, setActiveTab] = React.useState<TabId>("overview")
  const [saving, setSaving] = React.useState(false)

  // New timeline event form
  const [showTimelineForm, setShowTimelineForm] = React.useState(false)
  const [timelineForm, setTimelineForm] = React.useState({ eventType: "filing", eventTitle: "", eventDescription: "", eventDate: "", importance: "medium", isDeadline: false })

  // New task form
  const [showTaskForm, setShowTaskForm] = React.useState(false)
  const [taskForm, setTaskForm] = React.useState({ taskCategory: "evidence_gathering", taskTitle: "", taskDescription: "", priority: "medium", deadline: "" })

  async function handleToggleTask(taskId: number, isCompleted: boolean) {
    try {
      await fetch(`/api/cases/${caseId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      })
      refetch()
    } catch {
      toast.error("Failed to update task")
    }
  }

  async function handleAddTimelineEvent() {
    if (!timelineForm.eventTitle || !timelineForm.eventDate) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timelineForm),
      })
      if (!res.ok) throw new Error()
      toast.success("Event added")
      setShowTimelineForm(false)
      setTimelineForm({ eventType: "filing", eventTitle: "", eventDescription: "", eventDate: "", importance: "medium", isDeadline: false })
      refetch()
    } catch {
      toast.error("Failed to add event")
    } finally {
      setSaving(false)
    }
  }

  async function handleAddTask() {
    if (!taskForm.taskTitle) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      })
      if (!res.ok) throw new Error()
      toast.success("Task added")
      setShowTaskForm(false)
      setTaskForm({ taskCategory: "evidence_gathering", taskTitle: "", taskDescription: "", priority: "medium", deadline: "" })
      refetch()
    } catch {
      toast.error("Failed to add task")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10"><PageSkeleton rows={6} /></div>
  if (error) return <div className="mx-auto max-w-7xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>
  if (!caseData) return null

  const completedTasks = caseData.casePreparationTasks.filter((t) => t.isCompleted).length
  const totalTasks = caseData.casePreparationTasks.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <Link href="/cases" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Cases
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{caseData.caseTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {caseData.issue.organization} — {caseData.issue.issueType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[caseData.caseStatus] as "default" | "info" | "warning" | "brand" | "success" || "default"}>
              {caseData.caseStatus}
            </Badge>
            <Badge variant="secondary">{caseData.caseType}</Badge>
          </div>
        </div>
      </div>

      {/* Tabs — scrollable on mobile, icons-only on small screens */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 sm:px-3 sm:py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
        })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <CaseOverview
            caseData={caseData}
            caseId={caseId}
            onTabSwitch={setActiveTab}
            onToggleTask={handleToggleTask}
          />
        )}

        {/* EVIDENCE */}
        {activeTab === "evidence" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Evidence & Attachments</CardTitle>
                <Button variant="brand" size="sm" className="gap-1.5" disabled>
                  <Upload className="h-3.5 w-3.5" /> Upload Evidence
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload photos, videos, documents, and other evidence to support your case.
                File uploads require AWS S3 configuration — add your keys to .env.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Evidence upload will be available once S3 is configured.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: images, documents, audio, and video files
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TIMELINE */}
        {activeTab === "timeline" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Case Timeline</CardTitle>
                <Button variant="brand" size="sm" className="gap-1.5" onClick={() => setShowTimelineForm(!showTimelineForm)}>
                  <Plus className="h-3.5 w-3.5" /> Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showTimelineForm && (
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <Input placeholder="Event title" value={timelineForm.eventTitle} onChange={(e) => setTimelineForm({ ...timelineForm, eventTitle: e.target.value })} />
                  <Textarea placeholder="Description (optional)" value={timelineForm.eventDescription} onChange={(e) => setTimelineForm({ ...timelineForm, eventDescription: e.target.value })} className="min-h-[80px]" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={timelineForm.eventDate} onChange={(e) => setTimelineForm({ ...timelineForm, eventDate: e.target.value })} />
                    <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={timelineForm.eventType} onChange={(e) => setTimelineForm({ ...timelineForm, eventType: e.target.value })}>
                      <option value="filing">Filing</option>
                      <option value="hearing">Hearing</option>
                      <option value="deadline">Deadline</option>
                      <option value="response">Response</option>
                      <option value="appeal">Appeal</option>
                      <option value="settlement">Settlement</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={timelineForm.isDeadline} onChange={(e) => setTimelineForm({ ...timelineForm, isDeadline: e.target.checked })} />
                    This is a deadline
                  </label>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTimelineForm(false)}>Cancel</Button>
                    <Button variant="brand" size="sm" onClick={handleAddTimelineEvent} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Event"}
                    </Button>
                  </div>
                </div>
              )}

              {caseData.caseTimeline.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No timeline events yet. Add your first event above.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-border space-y-6">
                  {caseData.caseTimeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className={cn(
                        "absolute -left-[25px] h-3 w-3 rounded-full border-2 border-background",
                        event.isDeadline ? "bg-red-500" : event.isCompleted ? "bg-emerald-500" : "bg-brand-500"
                      )} />
                      <div className="rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold">{event.eventTitle}</h4>
                          <div className="flex items-center gap-2">
                            {event.isDeadline && <Badge variant="destructive" className="text-[10px]">Deadline</Badge>}
                            <Badge variant="secondary" className="text-[10px]">{event.eventType}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(event.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                        {event.eventDescription && <p className="text-sm text-muted-foreground mt-2">{event.eventDescription}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* DOCUMENTS */}
        {activeTab === "documents" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Court Documents</CardTitle>
                <Button variant="brand" size="sm" className="gap-1.5" disabled>
                  <Plus className="h-3.5 w-3.5" /> Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {caseData.courtDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No court documents yet.</p>
              ) : (
                <div className="space-y-3">
                  {caseData.courtDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <h4 className="text-sm font-semibold">{doc.documentTitle}</h4>
                        <p className="text-xs text-muted-foreground">
                          {doc.documentType} — {doc.status}
                          {doc.filedDate && ` — Filed ${new Date(doc.filedDate).toLocaleDateString("en-GB")}`}
                        </p>
                      </div>
                      <Badge variant={doc.status === "filed" ? "success" : doc.status === "served" ? "info" : "default"}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TASKS */}
        {activeTab === "tasks" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Preparation Tasks</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{completedTasks} of {totalTasks} completed</p>
                </div>
                <Button variant="brand" size="sm" className="gap-1.5" onClick={() => setShowTaskForm(!showTaskForm)}>
                  <Plus className="h-3.5 w-3.5" /> Add Task
                </Button>
              </div>
              {totalTasks > 0 && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {showTaskForm && (
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <Input placeholder="Task title" value={taskForm.taskTitle} onChange={(e) => setTaskForm({ ...taskForm, taskTitle: e.target.value })} />
                  <Textarea placeholder="Description (optional)" value={taskForm.taskDescription} onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })} className="min-h-[60px]" />
                  <div className="grid grid-cols-3 gap-3">
                    <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={taskForm.taskCategory} onChange={(e) => setTaskForm({ ...taskForm, taskCategory: e.target.value })}>
                      <option value="evidence_gathering">Evidence Gathering</option>
                      <option value="witness_prep">Witness Prep</option>
                      <option value="legal_research">Legal Research</option>
                      <option value="admin">Admin</option>
                      <option value="financial">Financial</option>
                    </select>
                    <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <Input type="date" placeholder="Deadline" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTaskForm(false)}>Cancel</Button>
                    <Button variant="brand" size="sm" onClick={handleAddTask} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Task"}
                    </Button>
                  </div>
                </div>
              )}

              {caseData.casePreparationTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tasks yet.</p>
              ) : (
                caseData.casePreparationTasks.map((task) => (
                  <div key={task.id} className={cn("flex items-start gap-3 rounded-lg border border-border p-4", task.isCompleted && "opacity-60")}>
                    <button
                      onClick={() => handleToggleTask(task.id, !task.isCompleted)}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 items-center justify-center rounded border transition-colors flex-shrink-0",
                        task.isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-border hover:border-brand-500"
                      )}
                    >
                      {task.isCompleted && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1">
                      <h4 className={cn("text-sm font-semibold", task.isCompleted && "line-through")}>{task.taskTitle}</h4>
                      {task.taskDescription && <p className="text-xs text-muted-foreground mt-0.5">{task.taskDescription}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-[10px]">{task.taskCategory.replace(/_/g, " ")}</Badge>
                        <span className={cn("text-[10px] font-medium", priorityColors[task.priority])}>{task.priority}</span>
                        {task.deadline && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.deadline).toLocaleDateString("en-GB")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* PRECEDENTS */}
        {activeTab === "precedents" && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Legal Precedents</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {caseData.legalPrecedents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No precedents linked. Open a case from an analysed issue to auto-populate.</p>
              ) : (
                caseData.legalPrecedents.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold">{p.caseName}</h4>
                        <p className="text-xs text-muted-foreground">{p.caseReference} — {p.court}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.isBinding && <Badge variant="brand" className="text-[10px]">Binding</Badge>}
                        <Badge variant={p.precedentStrength === "strong" ? "success" : p.precedentStrength === "medium" ? "warning" : "default"} className="text-[10px]">
                          {p.precedentStrength}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-foreground mb-2">{p.keyPrinciple}</p>
                    <p className="text-xs text-muted-foreground">{p.relevanceToCase}</p>
                    {p.caseUrl && (
                      <a href={p.caseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-2">
                        View Case <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* LEGISLATION */}
        {activeTab === "legislation" && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Relevant Legislation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {caseData.relevantLegislation.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No legislation linked yet.</p>
              ) : (
                caseData.relevantLegislation.map((l) => (
                  <div key={l.id} className="rounded-lg border border-border p-4">
                    <h4 className="text-sm font-semibold">{l.actTitle}{l.actYear ? ` (${l.actYear})` : ""}</h4>
                    {l.relevantProvisions && <p className="text-sm text-foreground mt-1">{l.relevantProvisions}</p>}
                    {l.applicationToCase && <p className="text-xs text-muted-foreground mt-1">{l.applicationToCase}</p>}
                    {l.url && (
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-2">
                        View on legislation.gov.uk <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* VIOLATIONS */}
        {activeTab === "violations" && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Rights Violations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {caseData.rightsViolations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No violations recorded yet.</p>
              ) : (
                caseData.rightsViolations.map((v) => (
                  <div key={v.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold">{v.violationType.replace(/_/g, " ")}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={severityColors[v.severity] as "default" | "warning" | "destructive" || "default"} className="text-[10px]">
                          {v.severity} severity
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {v.proofStrength} proof
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{v.description}</p>
                    {v.legislationBreach && <p className="text-xs text-muted-foreground mt-1">Breach: {v.legislationBreach}</p>}
                    {v.remedySought && <p className="text-xs text-brand-600 mt-1">Remedy: {v.remedySought}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
