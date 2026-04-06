"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMotoringCategory } from "@/lib/motoring-data"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Shield,
  Scale,
  ClipboardList,
  Route,
  Target,
  ExternalLink,
} from "lucide-react"
import { resolveActUrl } from "@/lib/legal-sources"

type Tab = "overview" | "authorities" | "legal" | "evidence" | "complaint-route" | "outcomes"

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: AlertTriangle },
  { key: "authorities", label: "Responsible Bodies", icon: Shield },
  { key: "legal", label: "Legal Framework", icon: Scale },
  { key: "evidence", label: "Evidence Checklist", icon: ClipboardList },
  { key: "complaint-route", label: "Complaint Route", icon: Route },
  { key: "outcomes", label: "Expected Outcomes", icon: Target },
]

export default function MotoringIssuePage() {
  const params = useParams()
  const slug = params.slug as string
  const category = getMotoringCategory(slug)
  const [activeTab, setActiveTab] = React.useState<Tab>("overview")
  const [checkedEvidence, setCheckedEvidence] = React.useState<Set<string>>(new Set())

  if (!category) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Issue Category Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The requested motoring issue category does not exist.</p>
        <Link href="/motoring" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to Motoring Hub
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

  const issueTypeParam = encodeURIComponent(category.title)
  const categoryParam = encodeURIComponent("Motoring & Vehicle Issues")

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link + header */}
      <div>
        <Link href="/motoring" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Motoring Hub
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{category.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      </div>

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
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Common Symptoms</h2>
              <ul className="mt-3 space-y-2">
                {category.symptoms.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Example Scenarios</h2>
              <ul className="mt-3 space-y-3">
                {category.exampleScenarios.map((s) => (
                  <li key={s} className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Link href={`/issues/new?category=${categoryParam}&type=${issueTypeParam}`}>
              <Button size="lg">
                Start Your Complaint <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Responsible Bodies Tab */}
      {activeTab === "authorities" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {(["primary", "secondary", "escalation"] as const).map((level) => {
            const body = category.responsibleBodies[level]
            const levelColors = {
              primary: "border-brand-200 bg-brand-50/50 dark:border-brand-900/30 dark:bg-brand-900/10",
              secondary: "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10",
              escalation: "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10",
            }
            const levelLabels = { primary: "Primary", secondary: "Secondary", escalation: "Escalation" }
            const levelBadgeVariants = {
              primary: "brand" as const,
              secondary: "warning" as const,
              escalation: "destructive" as const,
            }

            return (
              <Card key={level} className={levelColors[level]}>
                <CardContent className="p-4">
                  <Badge variant={levelBadgeVariants[level]} className="mb-2 text-[10px]">
                    {levelLabels[level]}
                  </Badge>
                  <h3 className="font-semibold">{body.name}</h3>
                  {body.abbreviation && (
                    <p className="text-xs text-muted-foreground">{body.abbreviation}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{body.role}</p>
                  <div className="mt-3 rounded-md bg-background/50 p-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">When to contact</p>
                    <p className="mt-0.5 text-xs">{body.whenToContact}</p>
                  </div>
                  {body.whatTheyCannotDo && (
                    <div className="mt-2 rounded-md bg-background/50 p-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Limitations</p>
                      <p className="mt-0.5 text-xs">{body.whatTheyCannotDo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Legal Framework Tab */}
      {activeTab === "legal" && (
        <div className="space-y-4">
          {category.legalFramework.map((law) => {
            const url = resolveActUrl(law.title)
            return (
              <Card key={law.title}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{law.title}</h3>
                      {law.section && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">{law.section}</Badge>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">{law.summary}</p>
                    </div>
                  </div>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      <ExternalLink className="h-3 w-3" /> View legislation
                    </a>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Evidence Checklist Tab */}
      {activeTab === "evidence" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Evidence Checklist</h2>
                <Badge variant="secondary">
                  {checkedEvidence.size}/{category.evidenceChecklist.length} gathered
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Tick off each piece of evidence as you gather it. The more evidence you have, the stronger your complaint.
              </p>
              <ul className="mt-4 space-y-2">
                {category.evidenceChecklist.map((item) => {
                  const isChecked = checkedEvidence.has(item)
                  return (
                    <li key={item}>
                      <button
                        onClick={() => toggleEvidence(item)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                          isChecked
                            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                        )}
                        <span className={isChecked ? "line-through text-muted-foreground" : ""}>{item}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Complaint Route Tab */}
      {activeTab === "complaint-route" && (
        <div className="space-y-4">
          {category.complaintRoute.map((step) => (
            <Card key={step.step}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {step.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-md bg-muted/50 p-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">What to submit</p>
                        <p className="mt-0.5 text-xs">{step.whatToSubmit}</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Expected outcome</p>
                        <p className="mt-0.5 text-xs">{step.expectedOutcome}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-4">
            <Link href={`/issues/new?category=${categoryParam}&type=${issueTypeParam}`}>
              <Button size="lg">
                Start This Complaint <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Expected Outcomes Tab */}
      {activeTab === "outcomes" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Realistic Expectations</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                These are the most common outcomes based on similar complaints. Results depend on the strength of your evidence and the specific circumstances.
              </p>
              <ul className="mt-4 space-y-2">
                {category.expectedOutcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
                    <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
