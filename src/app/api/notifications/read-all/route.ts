import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"

// POST /api/notifications/read-all — clear the badge in one action.
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const result = await db.notification.updateMany({
      where: { userId: parseInt(session.user.id), readAt: null },
      data: { readAt: new Date() },
    })

    return apiSuccess({ updated: result.count })
  } catch (error) {
    console.error("Error marking all notifications read:", error)
    return apiError("Failed to update notifications", 500)
  }
}
