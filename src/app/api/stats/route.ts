import { getPublicStats } from "@/lib/stats"
import { apiSuccess, apiError } from "@/lib/api-response"

// Public, unauthenticated — powers the landing page counters.
// Aggregate counts only; nothing here identifies a user or an issue.
export const revalidate = 300 // 5 minutes

export async function GET() {
  try {
    return apiSuccess(await getPublicStats())
  } catch (error) {
    console.error("Error loading public stats:", error)
    return apiError("Failed to load stats", 500)
  }
}
