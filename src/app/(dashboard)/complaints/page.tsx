"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useFetch } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState, ErrorState } from "@/components/ui/empty-state"
import type { ComplaintWithIssue } from "@/lib/types"
import {
  ArrowLeft,
  FileText,
  Send,
  Trash2,
  CheckCircle,
  Copy,
  AlertTriangle,
  X,
} from "lucide-react"

type TabType = "all" | "drafts" | "sent"

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("all")
  const { data: complaints, loading, error, refetch } = useFetch<ComplaintWithIssue[]>("/api/complaints")
  const [actionLoading, setActionLoading] = React.useState<number | null>(null)
  const [sendConfirmId, setSendConfirmId] = React.useState<number | null>(null)
  const [truthChecked, setTruthChecked] = React.useState(false)

  const filtered = (complaints || []).filter((c) => {
    if (activeTab === "drafts") return c.status === "draft"
    if (activeTab === "sent") return c.status === "sent"
    return true
  })

  const tabs: { value: TabType; label: string; count: number }[] = [
    { value: "all", label: "All Complaints", count: complaints?.length || 0 },
    { value: "drafts", label: "Drafts", count: complaints?.filter((c) => c.status === "draft").length || 0 },
    { value: "sent", label: "Sent", count: complaints?.filter((c) => c.status === "sent").length || 0 },
  ]

  async function handleCopyText(complaint: ComplaintWithIssue) {
    try {
      await navigator.clipboard.writeText(complaint.complaintText)
      toast.success("Complaint text copied to clipboard")
    } catch {
      toast.error("Failed to copy text")
    }
  }

  async function handleSend(id: number) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent", truthConfirmed: true }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed to send" }))
        throw new Error(body.error || "Failed to send complaint")
      }
      toast.success("Complaint sent successfully")
      setSendConfirmId(null)
      setTruthChecked(false)
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this complaint?")) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/complaints/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete complaint")
      toast.success("Complaint deleted")
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-lg bg-muted p-1 w-full sm:w-fit animate-fade-in" style={{ animationDelay: "0.05s" }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeTab === tab.value
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                : "bg-muted text-muted-foreground"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <PageSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={activeTab === "all" ? "No complaints yet" : `No ${activeTab} complaints`}
          description={activeTab === "all"
            ? "Complaints are auto-generated when you run AI analysis on an issue."
            : `You don't have any ${activeTab} complaints.`
          }
          actionLabel={activeTab === "all" ? "Log a New Issue" : undefined}
          onAction={activeTab === "all" ? () => window.location.href = "/issues/new" : undefined}
        />
      ) : (
        <div className="space-y-4 stagger-fade-in">
          {filtered.map((complaint) => (
            <Card key={complaint.id} className="card-hover overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {complaint.issue?.organization || "Unknown"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {complaint.issue?.issueType || "Unknown"} - Created on{" "}
                      {new Date(complaint.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={complaint.status === "sent" ? "success" : "default"}
                  >
                    {complaint.status === "sent" ? "Sent" : "Draft"}
                  </Badge>
                </div>

                <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {complaint.complaintText.slice(0, 200)}...
                </p>

                {complaint.status === "sent" && complaint.sentAt && (
                  <div className="mb-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Sent on {new Date(complaint.sentAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}{" "}
                    via {complaint.sentVia || "manual"}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/issues/${complaint.issueId}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      View Issue
                    </Button>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleCopyText(complaint)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Copy Text</span>
                      <span className="sm:hidden">Copy</span>
                    </Button>
                    {complaint.status === "draft" && (
                      <Button
                        variant="brand"
                        size="sm"
                        className="gap-1.5"
                        disabled={actionLoading === complaint.id}
                        onClick={() => {
                          setSendConfirmId(complaint.id)
                          setTruthChecked(false)
                        }}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      disabled={actionLoading === complaint.id}
                      onClick={() => handleDelete(complaint.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statement of Truth Modal */}
      {sendConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Confirm & Send</h3>
              </div>
              <button
                onClick={() => { setSendConfirmId(null); setTruthChecked(false) }}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
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
                onClick={() => { setSendConfirmId(null); setTruthChecked(false) }}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                size="sm"
                className="gap-1.5"
                disabled={!truthChecked || actionLoading === sendConfirmId}
                onClick={() => handleSend(sendConfirmId)}
              >
                {actionLoading === sendConfirmId ? (
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
