"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  MapPin,
  FileText,
  Send,
  Calendar,
  ArrowLeft,
} from "lucide-react"

const allIssues = [
  { id: 1, type: "Local Council", organization: "swansea council", hasComplaint: true, complaintSent: true, createdAt: "2025-04-13", status: "in_progress" },
  { id: 2, type: "Bailiff/Enforcement", organization: "exodus", hasComplaint: true, complaintSent: false, createdAt: "2025-04-14", status: "in_progress" },
  { id: 3, type: "Police Conduct", organization: "South wales police", hasComplaint: true, complaintSent: false, createdAt: "2025-04-13", status: "in_progress" },
  { id: 4, type: "School Board", organization: "south wales school boards", hasComplaint: true, complaintSent: false, createdAt: "2025-04-14", status: "in_progress" },
  { id: 5, type: "Solicitor", organization: "acuity law", hasComplaint: false, complaintSent: false, createdAt: "2025-09-28", status: "in_progress" },
  { id: 6, type: "Solicitor", organization: "acuity law", hasComplaint: false, complaintSent: false, createdAt: "2025-09-28", status: "in_progress" },
  { id: 7, type: "Solicitor", organization: "acuity law", hasComplaint: false, complaintSent: false, createdAt: "2025-09-28", status: "in_progress" },
  { id: 8, type: "Solicitor", organization: "acuity law", hasComplaint: false, complaintSent: false, createdAt: "2025-09-28", status: "in_progress" },
  { id: 9, type: "Solicitor", organization: "acuity law", hasComplaint: true, complaintSent: false, createdAt: "2025-09-28", status: "in_progress" },
]

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "info" | "default" }> = {
  in_progress: { label: "In Progress", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  complaint_sent: { label: "Complaint Sent", variant: "info" },
  draft: { label: "Draft", variant: "default" },
}

export default function IssuesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-foreground">All Issues</h1>
        </div>
        <Link href="/issues/new">
          <Button variant="brand" className="gap-2">
            <Plus className="h-4 w-4" />
            New Issue
          </Button>
        </Link>
      </div>

      <Card className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <div className="divide-y divide-border">
          {allIssues.map((issue, i) => {
            const status = statusConfig[issue.status] || statusConfig.draft
            return (
              <div
                key={issue.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/issues/${issue.id}`}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    {issue.type}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {issue.organization}
                    </span>
                    {issue.hasComplaint && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Complaint saved
                      </span>
                    )}
                    {issue.complaintSent && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Send className="h-3 w-3" />
                        Complaint submitted
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="hidden text-xs text-muted-foreground sm:flex sm:items-center sm:gap-1">
                    <Calendar className="h-3 w-3" />
                    Submitted on{" "}
                    {new Date(issue.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
