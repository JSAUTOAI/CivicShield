"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  MapPin,
  FileText,
  Send,
  Calendar,
  Trash2,
  ArrowRight,
  Shield,
  Megaphone,
  GraduationCap,
  Landmark,
  Plane,
  Camera,
  MessageSquare,
  Scale,
} from "lucide-react"

// Mock data — will be replaced with real DB queries
const recentIssues = [
  {
    id: 1,
    type: "Local Council",
    organization: "swansea council",
    hasComplaint: true,
    complaintSent: true,
    createdAt: "2025-04-13",
    status: "in_progress",
  },
  {
    id: 2,
    type: "Bailiff/Enforcement",
    organization: "exodus",
    hasComplaint: true,
    complaintSent: false,
    createdAt: "2025-04-14",
    status: "in_progress",
  },
  {
    id: 3,
    type: "Police Conduct",
    organization: "South wales police",
    hasComplaint: true,
    complaintSent: false,
    createdAt: "2025-04-13",
    status: "in_progress",
  },
  {
    id: 4,
    type: "School Board",
    organization: "south wales school boards",
    hasComplaint: true,
    complaintSent: false,
    createdAt: "2025-04-14",
    status: "in_progress",
  },
  {
    id: 5,
    type: "Solicitor",
    organization: "acuity law",
    hasComplaint: true,
    complaintSent: false,
    createdAt: "2025-09-28",
    status: "in_progress",
  },
]

const resourceGuides = [
  {
    title: "Bailiff Resistance Guide",
    description: "Learn about your rights when dealing with bailiffs and enforcement agents.",
    icon: Shield,
    href: "/resources/bailiff-resistance",
  },
  {
    title: "Protest Rights",
    description: "Know your legal rights for peaceful protest and assembly.",
    icon: Megaphone,
    href: "/resources/protest-rights",
  },
  {
    title: "School Policies Guide",
    description: "Understanding your rights within the education system.",
    icon: GraduationCap,
    href: "/resources/school-policies",
  },
  {
    title: "Council Accountability",
    description: "How to hold local government accountable for decisions.",
    icon: Landmark,
    href: "/resources/council-accountability",
  },
  {
    title: "Drone Rights Guide",
    description: "Protecting your natural rights when using drones in public.",
    icon: Plane,
    href: "/resources/drone-rights",
  },
  {
    title: "Photography Is Not A Crime",
    description: "Assert your right to film and photograph in public spaces.",
    icon: Camera,
    href: "/resources/photography-rights",
  },
  {
    title: "Free Speech Rights",
    description: "Assert your natural right to free speech and expression.",
    icon: MessageSquare,
    href: "/resources/free-speech",
  },
]

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "info" | "default" }> = {
  in_progress: { label: "In Progress", variant: "warning" },
  resolved: { label: "Resolved", variant: "success" },
  complaint_sent: { label: "Complaint Sent", variant: "info" },
  draft: { label: "Draft", variant: "default" },
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <Card className="overflow-hidden border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50/30 dark:border-brand-900/30 dark:from-brand-900/10 dark:via-card dark:to-brand-900/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                <Scale className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Welcome, Jake S
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your existing reports or create a new one.
                </p>
              </div>
            </div>
            <Link href="/issues/new">
              <Button variant="brand" size="lg" className="gap-2 shadow-md">
                <Plus className="h-4 w-4" />
                Log a New Issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Your Recent Issues
            </h2>
            <p className="text-sm text-muted-foreground">
              Track and manage your ongoing cases.
            </p>
          </div>
        </div>

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
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-border px-6 py-3">
            <Link
              href="/issues"
              className="flex items-center justify-end gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              View all issues
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </section>

      {/* Rights & Resources */}
      <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
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
