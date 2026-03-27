import { auth } from "@/lib/auth"
import { apiSuccess, apiError } from "@/lib/api-response"
import { createCheckoutSession } from "@/lib/stripe"
import { db } from "@/lib/db"

const TIER_PRICE_MAP: Record<string, string | undefined> = {
  basic: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
  pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  agency: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401)
    }

    const body = await request.json()
    const tier = body.tier as string

    const priceId = TIER_PRICE_MAP[tier]
    if (!tier || !priceId) {
      return apiError("Invalid subscription tier", 400)
    }

    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { email: true, fullName: true },
    })

    if (!user) {
      return apiError("User not found", 404)
    }

    const checkoutUrl = await createCheckoutSession(
      parseInt(session.user.id),
      priceId,
      user.email,
      user.fullName || undefined
    )

    return apiSuccess({ url: checkoutUrl })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return apiError("Failed to create checkout session", 500)
  }
}
