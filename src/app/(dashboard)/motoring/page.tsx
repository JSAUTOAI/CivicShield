"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MOTORING_ISSUE_CATEGORIES,
  MOTORING_AUTHORITIES,
  MOTORING_LAWS,
} from "@/lib/motoring-data"
import { MOTORING_DEFECT_HUBS } from "@/lib/motoring-defect-hubs"
import { resolveActUrl } from "@/lib/legal-sources"
import {
  Search,
  AlertTriangle,
  Store,
  ShieldOff,
  Wrench,
  Banknote,
  Shield,
  ClipboardCheck,
  Cog,
  FileKey,
  Lock,
  Car,
  ArrowRight,
  ExternalLink,
  Navigation,
  Siren,
  Scale,
} from "lucide-react"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Store,
  ShieldOff,
  Wrench,
  Banknote,
  Shield,
  ClipboardCheck,
  Cog,
  FileKey,
  Lock,
}

export default function MotoringHubPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeSection, setActiveSection] = React.useState<"categories" | "authorities" | "laws">("categories")

  const filteredCategories = MOTORING_ISSUE_CATEGORIES.filter(
    (c) =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAuthorities = MOTORING_AUTHORITIES.filter(
    (a) =>
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredLaws = MOTORING_LAWS.filter(
    (l) =>
      !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <Car className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Motoring Authority & Accountability Hub</h1>
            <p className="text-sm text-muted-foreground">
              Build your case, generate complaints, and hold motoring companies and regulators accountable
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/issues/new?category=Motoring+%26+Vehicle+Issues&type=Vehicle+Safety+Defects+%26+Recalls">
          <Card className="card-hover border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                <Siren className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-red-900 dark:text-red-300">Report Safety Defect</p>
                <p className="text-xs text-red-700/70 dark:text-red-400/70">File a complaint about a dangerous vehicle defect</p>
              </div>
              <ArrowRight className="h-4 w-4 text-red-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/motoring/router">
          <Card className="card-hover border-brand-200 bg-brand-50/50 dark:border-brand-900/30 dark:bg-brand-900/10">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                <Navigation className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-900 dark:text-brand-300">Smart Issue Router</p>
                <p className="text-xs text-brand-700/70 dark:text-brand-400/70">Answer questions to find the right authority</p>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/motoring/defects">
          <Card className="card-hover border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-300">Known Defect Alerts</p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
                  {MOTORING_DEFECT_HUBS.length} known manufacturer defect{MOTORING_DEFECT_HUBS.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Search + Tab Navigation */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories, authorities, or laws..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {([
            { key: "categories", label: "Issue Categories", icon: Car, count: filteredCategories.length },
            { key: "authorities", label: "Authorities", icon: Shield, count: filteredAuthorities.length },
            { key: "laws", label: "Laws & Rights", icon: Scale, count: filteredLaws.length },
          ] as const).map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  activeSection === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                  {tab.count}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* Issue Categories */}
      {activeSection === "categories" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Issue Categories</h2>
          {filteredCategories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No categories matching &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCategories.map((category) => {
                const Icon = ICON_MAP[category.icon] || Car
                return (
                  <Link key={category.slug} href={`/motoring/issues/${category.slug}`}>
                    <Card className="card-hover h-full">
                      <CardContent className="flex gap-4 p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                          <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{category.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {category.symptoms.slice(0, 2).map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px]">
                                {s}
                              </Badge>
                            ))}
                            {category.symptoms.length > 2 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{category.symptoms.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Authorities Directory */}
      {activeSection === "authorities" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Authorities Directory</h2>
          {filteredAuthorities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No authorities matching &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredAuthorities.map((authority) => (
                <Link key={authority.slug} href={`/motoring/authorities/${authority.slug}`}>
                  <Card className="card-hover h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{authority.abbreviation}</p>
                            <Badge variant="secondary" className="text-[10px]">
                              {authority.jurisdiction.split("(")[0].trim()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{authority.name}</p>
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                            {authority.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Laws & Rights */}
      {activeSection === "laws" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Laws & Rights</h2>
          {filteredLaws.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No laws matching &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredLaws.map((law) => {
                const url = resolveActUrl(law.title) || law.legislationUrl
                return (
                  <Card key={law.slug} className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{law.title}</p>
                            <Badge variant="brand" className="text-[10px]">
                              {law.year}
                            </Badge>
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                            {law.description}
                          </p>
                          <div className="mt-3 space-y-1">
                            {law.keyRights.slice(0, 3).map((right) => (
                              <p key={right} className="text-xs text-muted-foreground">
                                &bull; {right}
                              </p>
                            ))}
                            {law.keyRights.length > 3 && (
                              <p className="text-xs text-brand-600 dark:text-brand-400">
                                +{law.keyRights.length - 3} more rights
                              </p>
                            )}
                          </div>
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            <strong>Time limits:</strong> {law.timeLimits}
                          </p>
                        </div>
                      </div>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View on legislation.gov.uk
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
