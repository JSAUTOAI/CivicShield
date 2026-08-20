"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState, ErrorState } from "@/components/ui/empty-state"
import { useFetch } from "@/lib/hooks"
import { formatDate } from "@/lib/utils"
import { Bell, CheckCheck, Send, MailOpen, MessageSquare, Sparkles, FileSignature } from "lucide-react"

interface Notification {
  id: number
  type: string
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  createdAt: string
}

const ICONS: Record<string, React.ElementType> = {
  complaint_sent: Send,
  complaint_opened: MailOpen,
  reply_received: MessageSquare,
  analysis_complete: Sparkles,
  petition_signed: FileSignature,
  system: Bell,
}

export default function NotificationsPage() {
  const router = useRouter()
  const { data, loading, error, refetch } =
    useFetch<{ data: { unreadCount: number; notifications: Notification[] } }>("/api/notifications")

  const notifications = React.useMemo(() => data?.data?.notifications ?? [], [data])
  const unreadCount = data?.data?.unreadCount ?? 0
  const [marking, setMarking] = React.useState(false)

  async function markAllRead() {
    setMarking(true)
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" })
      if (!res.ok) throw new Error("Could not mark notifications as read")
      refetch()
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setMarking(false)
    }
  }

  async function openNotification(n: Notification) {
    // Mark read in the background — never make the user wait to follow a link.
    if (!n.readAt) {
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {})
    }
    if (n.link) router.push(n.link)
    else refetch()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && <Badge variant="brand">{unreadCount} new</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates on your complaints — when they&apos;re sent, opened, and replied to
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead} loading={marking}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <PageSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing yet"
          description="When you send a complaint, we'll tell you here as soon as it's opened or replied to."
        />
      ) : (
        <div className="space-y-2 stagger-fade-in">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Bell
            const unread = !n.readAt
            return (
              <Card
                key={n.id}
                className={cn("card-hover cursor-pointer", unread && "border-brand-200 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-900/10")}
                onClick={() => openNotification(n)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
                      unread ? "bg-brand-100 dark:bg-brand-900/30" : "bg-muted"
                    )}
                  >
                    <Icon className={cn("h-4.5 w-4.5", unread ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", unread ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                        {n.title}
                      </p>
                      {unread && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />}
                    </div>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Something not working?{" "}
        <Link href="/help" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Contact support
        </Link>
      </p>
    </div>
  )
}
