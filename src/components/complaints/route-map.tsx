"use client"

import * as React from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Route as RouteIcon,
  Lock,
  Mail,
  ExternalLink,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Copy,
  CheckCircle2,
} from "lucide-react"

export interface ComplaintRouteView {
  id: number
  routeType: "primary" | "parallel" | "escalation"
  organizationName: string
  purpose: string
  method: "email" | "form" | "post"
  contactEmail: string | null
  contactAddress: string | null
  formUrl: string | null
  sourceUrl: string | null
  condition: string | null
  deadlineNote: string | null
  status: "locked" | "available" | "sent" | "skipped"
  lockReason: string | null
}

const TYPE_LABEL: Record<ComplaintRouteView["routeType"], string> = {
  primary: "Send now",
  parallel: "Also send now",
  escalation: "If unresolved",
}

const TYPE_BLURB: Record<ComplaintRouteView["routeType"], string> = {
  primary: "The organisation itself. Start here.",
  parallel: "A different purpose, not an escalation — worth doing at the same time.",
  escalation: "The same complaint taken further. Most bodies reject these if the organisation hasn't had its chance first.",
}

/**
 * Every route a complaint can take, and when each becomes appropriate.
 *
 * Escalations are shown locked with the reason rather than hidden, so the user
 * can see what's coming and why they have to wait — the 8-week rules exist,
 * and a complaint sent early to an ombudsman is usually just rejected.
 */
export function RouteMap({
  issueId,
  complaintText,
}: {
  issueId: string | number
  complaintText?: string
}) {
  const [routes, setRoutes] = React.useState<ComplaintRouteView[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [generating, setGenerating] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/routes`)
      if (res.ok) {
        const body = await res.json()
        setRoutes(body.routes ?? [])
      }
    } catch {
      // Non-fatal — the section simply offers to generate.
    } finally {
      setLoading(false)
    }
  }, [issueId])

  React.useEffect(() => {
    load()
  }, [load])

  async function generate() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/issues/${issueId}/routes`, { method: "POST" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Couldn't work out the routes")
      setRoutes(body.routes ?? [])
      toast.success("Routes mapped")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return null

  if (!routes || routes.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <RouteIcon className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Where else can this complaint go?
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Regulators, ombudsmen and other bodies that may be able to act — with
                verified contacts and when each becomes available.
              </p>
            </div>
          </div>
          <Button
            variant="brand"
            size="sm"
            className="flex-shrink-0 gap-1.5"
            onClick={generate}
            loading={generating}
          >
            <RouteIcon className="h-3.5 w-3.5" />
            Map the routes
          </Button>
        </CardContent>
      </Card>
    )
  }

  const grouped: ComplaintRouteView["routeType"][] = ["primary", "parallel", "escalation"]

  return (
    <section className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Where this can go</h3>
          <p className="text-sm text-muted-foreground">
            Check every contact against its source before you send.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={generate} loading={generating}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Redo</span>
        </Button>
      </div>

      <div className="space-y-5">
        {grouped.map((type) => {
          const inType = routes.filter((r) => r.routeType === type)
          if (inType.length === 0) return null

          return (
            <div key={type}>
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-foreground">{TYPE_LABEL[type]}</h4>
                <p className="text-xs text-muted-foreground">{TYPE_BLURB[type]}</p>
              </div>

              <div className="space-y-2">
                {inType.map((r) => {
                  const locked = r.status === "locked"
                  return (
                    <Card
                      key={r.id}
                      className={cn(
                        "overflow-hidden",
                        locked && "opacity-70",
                        r.status === "sent" &&
                          "border-emerald-300 dark:border-emerald-800"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {r.organizationName}
                              </span>
                              {r.method === "form" && (
                                <Badge variant="default" className="text-[10px]">
                                  Their own form
                                </Badge>
                              )}
                              {r.status === "sent" && (
                                <Badge variant="success" className="gap-1 text-[10px]">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Sent
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{r.purpose}</p>
                          </div>
                          {locked && (
                            <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          )}
                        </div>

                        {r.deadlineNote && (
                          <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              <span className="font-semibold">Time limit: </span>
                              {r.deadlineNote}
                            </span>
                          </p>
                        )}

                        {locked && r.lockReason && (
                          <p className="mt-2 text-xs font-medium text-muted-foreground">
                            {r.lockReason}
                            {r.condition ? ` — ${r.condition}` : ""}
                          </p>
                        )}

                        {!locked && r.condition && r.routeType !== "primary" && (
                          <p className="mt-2 text-xs text-muted-foreground">{r.condition}</p>
                        )}

                        {!locked && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {r.method === "email" && r.contactEmail && (
                              <>
                                <a href={`mailto:${r.contactEmail}`}>
                                  <Button variant="outline" size="sm" className="gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    {r.contactEmail}
                                  </Button>
                                </a>
                                {complaintText && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(complaintText)
                                      toast.success("Complaint copied — paste it into your email")
                                    }}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy letter
                                  </Button>
                                )}
                              </>
                            )}

                            {r.method === "form" && r.formUrl && (
                              <>
                                <a href={r.formUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="brand" size="sm" className="gap-1.5">
                                    Open their form
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                </a>
                                {complaintText && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(complaintText)
                                      toast.success("Complaint copied — paste it into their form")
                                    }}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy letter
                                  </Button>
                                )}
                              </>
                            )}

                            {r.contactAddress && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {r.contactAddress}
                              </span>
                            )}

                            {!r.contactEmail && !r.formUrl && !r.contactAddress && (
                              <span className="text-xs text-amber-600 dark:text-amber-500">
                                No contact details could be verified — you&apos;ll need to find
                                them yourself.
                              </span>
                            )}
                          </div>
                        )}

                        {r.sourceUrl && (
                          <p className="mt-2 truncate text-[11px] text-muted-foreground">
                            Source:{" "}
                            <a
                              href={r.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 hover:underline dark:text-brand-400"
                            >
                              {r.sourceUrl}
                            </a>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        CivicShield is a legal information tool, not a legal adviser. Time limits and
        eligibility rules change — always confirm with the body itself before relying on
        a date shown here.
      </p>
    </section>
  )
}
