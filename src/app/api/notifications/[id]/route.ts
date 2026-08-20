import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"

// PATCH /api/notifications/:id — mark a single notification read.
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const userId = parseInt(session.user.id)
    const { id } = await params
    const notificationId = parseInt(id)

    if (!Number.isFinite(notificationId)) {
      return apiError("Invalid notification id", 400)
    }

    // Scoped by userId as well as id — otherwise one user could mark
    // another's notifications read by guessing sequential ids.
    const result = await db.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    })

    if (result.count === 0) {
      // Either it doesn't exist, isn't theirs, or was already read. All three
      // are fine outcomes for the caller and none should leak which.
      return apiSuccess({ updated: 0 })
    }

    return apiSuccess({ updated: result.count })
  } catch (error) {
    console.error("Error marking notification read:", error)
    return apiError("Failed to update notification", 500)
  }
}
