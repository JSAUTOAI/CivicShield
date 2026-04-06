"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDefectHub } from "@/lib/motoring-defect-hubs"
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Shield,
  Car,
  Wrench,
  Scale,
  ClipboardList,
  Route,
  CheckCircle2,
  Circle,
  ExternalLink,
} from "lucide-react"

type Tab = "overview" | "mechanism" | "evidence" | "strategy" | "escalation"

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: AlertTriangle },
  { key: "mechanism", label: "Failure Details", icon: Wrench },
  { key: "evidence", label: "Evidence", icon: ClipboardList },
  { key: "strategy", label: "Complaint Strategy", icon: Route },
  { key: "escalation", label: "Escalation", icon: Scale },
]

export default function DefectHubDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const defect = getDefectHub(slug)
  const [activeTab, setActiveTab] = React.useState<Tab>("overview")
  const [checkedEvidence, setCheckedEvidence] = React.useState<Set<string>>(new Set())

  if (!defect) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Defect Hub Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The requested defect hub does not exist.</p>
        <Link href="/motoring/defects" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to Defect Alerts
        </Link>
      </div>
    )
  }

  const toggleEvidence = (item: string) => {
    setCheckedEvidence((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const severityColors = {
    critical: "border-red-300 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20",
    high: "border-amber-300 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20",
    medium: "border-yellow-300 bg-yellow-50 dark:border-yellow-900/40 dark:bg-yellow-900/20",
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <Link href="/motoring/defects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Known Defects
        </Link>
        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="destructive">{defect.severity.toUpperCase()} SEVERITY</Badge>
            <Badge variant="secondary">{defect.manufacturer}</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{defect.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{defect.subtitle}</p>
        </div>
      </div>

      {/* Affected Models Banner */}
      <Card className={severityColors[defect.severity]}>
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold">Affected Vehicles</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {defect.affectedModels.map((m) => (
              <Badge key={m.model} variant="secondary">
                <Car className="mr-1 h-3 w-3" />
                {m.model} ({m.years})
                {m.variants && <span className="ml-1 text-[10px] text-muted-foreground">— {m.variants}</span>}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all sm:text-sm",
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Issue Description</h2>
              <p className="mt-2 text-sm leading-relaxed">{defect.issueDescription}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Safety Impact</h2>
              <p className="mt-2 text-sm leading-relaxed">{defect.safetyImpact}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Known Repair Cost</h3>
                <p className="mt-1 text-lg font-bold">{defect.knownCost}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Community Reports</h3>
                <p className="mt-1 text-lg font-bold">{defect.communityReportCount || "Multiple confirmed"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-amber-200 dark:border-amber-900/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold">DVSA Position</h3>
                <p className="mt-1 text-xs text-muted-foreground">{defect.dvsaPosition}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-900/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold">Manufacturer Position</h3>
                <p className="mt-1 text-xs text-muted-foreground">{defect.manufacturerPosition}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Failure Mechanism Tab */}
      {activeTab === "mechanism" && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Failure Mechanism</h2>
            <p className="mt-3 text-sm leading-relaxed">{defect.failureMechanism}</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Related Legislation</h3>
              <ul className="mt-2 space-y-2">
                {defect.relatedLegislation.map((leg) => (
                  <li key={leg} className="flex items-start gap-2 text-sm">
                    <Scale className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    {leg}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence Tab */}
      {activeTab === "evidence" && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Evidence Examples</h2>
              <Badge variant="secondary">
                {checkedEvidence.size}/{defect.evidenceExamples.length}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tick off evidence as you gather it. These are the key items that strengthen your case for this specific defect.
            </p>
            <ul className="mt-4 space-y-2">
              {defect.evidenceExamples.map((item) => {
                const isChecked = checkedEvidence.has(item)
                return (
                  <li key={item}>
                    <button
                      onClick={() => toggleEvidence(item)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                        isChecked
                          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span className={isChecked ? "line-through text-muted-foreground" : ""}>{item}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Complaint Strategy Tab */}
      {activeTab === "strategy" && (
        <div className="space-y-4">
          {defect.complaintStrategy.map((step) => (
            <Card key={step.step}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {step.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="secondary" className="mb-1 text-[10px]">{step.target}</Badge>
                    <p className="text-sm">{step.action}</p>
                    <ul className="mt-3 space-y-1.5">
                      {step.keyPoints.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Shield className="mt-0.5 h-3 w-3 flex-shrink-0 text-brand-500" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-4">
            <Link href={`/issues/new?category=${encodeURIComponent("Motoring & Vehicle Issues")}&type=${encodeURIComponent("Vehicle Safety Defects & Recalls")}`}>
              <Button size="lg">
                Build Your Complaint <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Escalation Tab */}
      {activeTab === "escalation" && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Escalation Paths</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              If one body fails to act, escalate to the next. Each path represents an independent route.
            </p>
            <div className="mt-4 space-y-4">
              {defect.escalationPath.map((path, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {path.split(" → ").map((step, j, arr) => (
                      <React.Fragment key={j}>
                        <Badge
                          variant={j === arr.length - 1 ? "brand" : "secondary"}
                          className="text-xs"
                        >
                          {step}
                        </Badge>
                        {j < arr.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
