"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOTORING_DEFECT_HUBS } from "@/lib/motoring-defect-hubs"
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"

const severityColors = {
  critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
  high: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30",
}

const severityBadge = {
  critical: "destructive" as const,
  high: "warning" as const,
  medium: "secondary" as const,
}

export default function DefectsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href="/motoring" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Motoring Hub
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Known Manufacturer Defects</h1>
            <p className="text-sm text-muted-foreground">
              Active defect alerts with complaint strategies and escalation paths
            </p>
          </div>
        </div>
      </div>

      {MOTORING_DEFECT_HUBS.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No known defect hubs have been added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {MOTORING_DEFECT_HUBS.map((defect) => (
            <Link key={defect.slug} href={`/motoring/defects/${defect.slug}`}>
              <Card className={`card-hover border ${severityColors[defect.severity]}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={severityBadge[defect.severity]}>
                          {defect.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">{defect.manufacturer}</Badge>
                      </div>
                      <h2 className="mt-2 text-lg font-bold">{defect.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{defect.subtitle}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {defect.affectedModels.slice(0, 3).map((m) => (
                          <Badge key={m.model} variant="secondary" className="text-[10px]">
                            {m.model} ({m.years})
                          </Badge>
                        ))}
                        {defect.affectedModels.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{defect.affectedModels.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {defect.communityReportCount && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Reports: {defect.communityReportCount}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="mt-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
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
