import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"

// GET /api/notifications — list the user's notifications plus the unread count.
// The navbar polls this for the badge, so it stays deliberately cheap.
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const countOnly = searchParams.get("countOnly") === "true"

    const unreadCount = await db.notification.count({
      where: { userId, readAt: null },
    })

    if (countOnly) {
      return apiSuccess({ unreadCount, notifications: [] })
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return apiSuccess({ unreadCount, notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return apiError("Failed to fetch notifications", 500)
  }
}
