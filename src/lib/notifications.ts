import { db } from "@/lib/db"

/**
 * In-app notifications.
 *
 * The navbar bell used to render a hardcoded "3" and had no click handler.
 * These are the real events behind it.
 */
export type NotificationType =
  | "complaint_sent"
  | "complaint_opened"
  | "reply_received"
  | "analysis_complete"
  | "petition_signed"
  | "system"

/**
 * Record a notification for a user.
 *
 * Never throws. Notifications are a side effect of things that matter more —
 * a complaint being sent, a reply arriving — and a failure to log one must
 * never fail the operation that triggered it.
 */
export async function notify(params: {
  userId: number
  type: NotificationType
  title: string
  body?: string
  link?: string
}): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body ?? null,
        link: params.link ?? null,
      },
    })
  } catch (error) {
    console.error("Failed to record notification:", error)
  }
}

/** Unread count for the navbar badge. */
export async function getUnreadCount(userId: number): Promise<number> {
  return db.notification.count({ where: { userId, readAt: null } })
}
