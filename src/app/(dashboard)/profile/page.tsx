"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { useFetch } from "@/lib/hooks"
import { formatDate } from "@/lib/utils"
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Shield,
  FileText,
  AlertCircle,
  Send,
  Settings,
} from "lucide-react"

interface UserProfile {
  id: number
  username: string
  email: string
  fullName: string | null
  phone: string | null
  address: string | null
  theme: string
  subscriptionStatus: string
  subscriptionTier: string
  subscriptionExpiresAt: string | null
  createdAt: string
}

interface Issue {
  id: number
  status: string
}

export default function ProfilePage() {
  const { data: profileResponse, loading: profileLoading } = useFetch<{
    success: boolean
    data: UserProfile
  }>("/api/settings/profile")
  const profile = profileResponse?.data || (profileResponse as unknown as UserProfile)

  const { data: issuesResponse, loading: issuesLoading } = useFetch<{
    success: boolean
    data: Issue[]
  }>("/api/issues")
  const issues = issuesResponse?.data ?? (Array.isArray(issuesResponse) ? issuesResponse as unknown as Issue[] : [])

  const totalIssues = issues.length
  const activeComplaints = issues.filter((i) => i.status === "in_progress" || i.status === "analyzed").length
  const sentComplaints = issues.filter((i) => i.status === "sent" || i.status === "complaint_sent").length

  const stats = [
    { label: "Total Issues", value: totalIssues, icon: FileText, color: "text-brand-600 dark:text-brand-400" },
    { label: "Active Complaints", value: activeComplaints, icon: AlertCircle, color: "text-amber-600 dark:text-amber-400" },
    { label: "Sent Complaints", value: sentComplaints, icon: Send, color: "text-emerald-600 dark:text-emerald-400" },
  ]

  const infoFields = [
    { label: "Full Name", value: profile?.fullName, icon: User },
    { label: "Email", value: profile?.email, icon: Mail },
    { label: "Username", value: profile?.username, icon: Shield },
    { label: "Member Since", value: profile?.createdAt ? formatDate(profile.createdAt) : null, icon: Calendar },
    { label: "Phone", value: profile?.phone, icon: Phone },
    { label: "Address", value: profile?.address, icon: MapPin },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your account details and activity overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="card-hover">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  {issuesLoading ? (
                    <Skeleton className="h-7 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Profile Details */}
      <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
            <Link href="/settings">
              <Button variant="brand" className="gap-2">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {profileLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {infoFields.map((field) => {
                const Icon = field.icon
                return (
                  <div
                    key={field.label}
                    className="flex items-start gap-3 rounded-lg border border-border p-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                      <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{field.label}</p>
                      <p className="text-sm font-medium text-foreground">
                        {field.value || "Not set"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Subscription Badge */}
          {profile && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-border p-4">
              <Shield className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <div>
                <p className="text-xs text-muted-foreground">Subscription</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {profile.subscriptionTier === "pro"
                      ? "Pro Plan"
                      : profile.subscriptionTier === "agency"
                        ? "Agency Plan"
                        : "Free Plan"}
                  </p>
                  <Badge
                    variant={
                      profile.subscriptionTier === "pro" || profile.subscriptionTier === "agency"
                        ? "brand"
                        : "default"
                    }
                  >
                    {profile.subscriptionStatus || "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
