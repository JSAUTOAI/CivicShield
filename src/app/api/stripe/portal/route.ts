import { auth } from "@/lib/auth"
import { apiSuccess, apiError } from "@/lib/api-response"
import { createPortalSession } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401)
    }

    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return apiError("No active subscription found", 400)
    }

    const portalUrl = await createPortalSession(user.stripeCustomerId)

    return apiSuccess({ url: portalUrl })
  } catch (error) {
    console.error("Stripe portal error:", error)
    return apiError("Failed to create portal session", 500)
  }
}
