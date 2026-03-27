"use client"

import * as React from "react"
import Link from "next/link"
import { useFetch } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState, ErrorState } from "@/components/ui/empty-state"
import {
  Briefcase,
  ArrowLeft,
  FileText,
  Clock,
  CheckSquare,
  Scale,
} from "lucide-react"

interface CaseListItem {
  id: number
  caseTitle: string
  caseType: string
  caseStatus: string
  caseStrength: number
  courtLevel: string | null
  legalRepresentation: string
  createdAt: string
  updatedAt: string
  issue: {
    id: number
    issueType: string
    organization: string
  }
  _count: {
    courtDocuments: number
    caseTimeline: number
    casePreparationTasks: number
  }
}

const statusColors: Record<string, string> = {
  preparation: "default",
  filed: "info",
  ongoing: "warning",
  appealed: "brand",
  concluded: "success",
}

export default function CasesPage() {
  const { data: cases, loading, error, refetch } = useFetch<CaseListItem[]>("/api/cases")

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Case Manager</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage your legal cases from complaint to resolution
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <PageSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !cases || cases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No cases yet"
          description="Open a case from any issue with AI analysis to start tracking your legal journey."
          actionLabel="View My Issues"
          onAction={() => window.location.href = "/issues"}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
          {cases.map((c) => (
            <Link key={c.id} href={`/cases/${c.id}`}>
              <Card className="card-hover h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={statusColors[c.caseStatus] as "default" | "info" | "warning" | "brand" | "success" || "default"}>
                      {c.caseStatus}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full mx-0.5 ${
                              i < c.caseStrength ? "bg-brand-500" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2">
                    {c.caseTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {c.issue.organization} — {c.issue.issueType}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {c._count.courtDocuments} docs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {c._count.caseTimeline} events
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3.5 w-3.5" />
                      {c._count.casePreparationTasks} tasks
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {c.caseType}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Updated {new Date(c.updatedAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
