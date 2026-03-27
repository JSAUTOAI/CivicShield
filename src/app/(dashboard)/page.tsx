"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useFetch } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import type { IssueListItem } from "@/lib/types"
import {
  Plus,
  MapPin,
  FileText,
  Send,
  Calendar,
  ArrowRight,
  Shield,
  Megaphone,
  GraduationCap,
  Landmark,
  Plane,
  Camera,
  MessageSquare,
  Scale,
  AlertCircle,
} from "lucide-react"

const resourceGuides = [
  {
    title: "Bailiff Resistance Guide",
    description: "Learn about your rights when dealing with bailiffs and enforcement agents.",
    icon: Shield,
    href: "/resources",
  },
  {
    title: "Protest Rights",
    description: "Know your legal rights for peaceful protest and assembly.",
    icon: Megaphone,
    href: "/resources",
  },
  {
    title: "School Policies Guide",
    description: "Understanding your rights within the education system.",
    icon: GraduationCap,
    href: "/resources",
  },
  {
    title: "Council Accountability",
    description: "How to hold local government accountable for decisions.",
    icon: Landmark,
    href: "/resources",
  },
  {
    title: "Drone Rights Guide",
    description: "Protecting your natural rights when using drones in public.",
    icon: Plane,
    href: "/resources",
  },
  {
    title: "Photography Is Not A Crime",
    description: "Assert your right to film and photograph in public spaces.",
    icon: Camera,
    href: "/resources",
  },
  {
    title: "Free Speech Rights",
    description: "Assert your natural right to free speech and expression.",
    icon: MessageSquare,
    href: "/resources",
  },
]

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "info" | "default" }> = {
  in_progress: { label: "In Progress", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  complaint_sent: { label: "Complaint Sent", variant: "info" },
  draft: { label: "Draft", variant: "default" },
}

export default function HomePage() {
  const { data: session } = useSession()
  const { data: issues, loading, error } = useFetch<IssueListItem[]>("/api/issues")

  const recentIssues = issues?.slice(0, 5) || []
  const userName = session?.user?.name || "there"

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-12 animate-fade-in">
        <Card className="overflow-hidden border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50/30 dark:border-brand-900/30 dark:from-brand-900/10 dark:via-card dark:to-brand-900/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                <Scale className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Welcome, {userName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your existing reports or create a new one.
                </p>
              </div>
            </div>
            <Link href="/issues/new" className="flex-shrink-0">
              <Button variant="brand" size="lg" className="gap-2 shadow-md w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Log a New Issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Your Recent Issues
            </h2>
            <p className="text-sm text-muted-foreground">
              Track and manage your ongoing cases.
            </p>
          </div>
        </div>

        {loading ? (
          <PageSkeleton rows={3} />
        ) : error ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Failed to load issues. Please try again later.</p>
            </CardContent>
          </Card>
        ) : recentIssues.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No issues yet"
            description="Log your first issue to get started. Our AI will analyse it and generate a formal complaint for you."
            actionLabel="Log a New Issue"
            onAction={() => window.location.href = "/issues/new"}
          />
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {recentIssues.map((issue) => {
                const status = statusConfig[issue.status] || statusConfig.draft
                return (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {issue.issueType}
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

            {(issues?.length || 0) > 5 && (
              <div className="border-t border-border px-6 py-3">
                <Link
                  href="/issues"
                  className="flex items-center justify-end gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View all issues
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </Card>
        )}
      </section>

      {/* Rights & Resources */}
      <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">
            Rights & Resources
          </h2>
          <p className="text-sm text-muted-foreground">
            Educational materials to help you understand your rights.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resourceGuides.map((guide) => {
            const Icon = guide.icon
            return (
              <Link key={guide.title} href={guide.href}>
                <Card className="card-hover h-full">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                      <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {guide.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {guide.description}
                      </p>
                    </div>
                    <span className="mt-auto flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                      Read guide
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
