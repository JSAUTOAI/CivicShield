import { auth } from "@/lib/auth"
import { apiSuccess, apiError } from "@/lib/api-response"
import { getUsageStats } from "@/lib/subscription"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401)
    }

    const stats = await getUsageStats(parseInt(session.user.id))

    if (!stats) {
      return apiError("User not found", 404)
    }

    return apiSuccess(stats)
  } catch (error) {
    console.error("Usage stats error:", error)
    return apiError("Failed to fetch usage stats", 500)
  }
}
