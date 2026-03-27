import Stripe from "stripe"
import { db } from "@/lib/db"

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeClient
}

/**
 * Map Stripe price IDs to subscription tiers.
 */
export function getTierFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!]: "basic",
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID!]: "pro",
    [process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!]: "agency",
  }
  return map[priceId] || "free"
}

/**
 * Get all valid price IDs for validation.
 */
export function getValidPriceIds(): string[] {
  return [
    process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
  ].filter(Boolean) as string[]
}

/**
 * Find or create a Stripe Customer for a user.
 */
export async function getOrCreateCustomer(
  userId: number,
  email: string,
  name?: string
): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  const stripe = getStripe()
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId: String(userId) },
  })

  await db.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

/**
 * Create a Stripe Checkout Session for a subscription.
 */
export async function createCheckoutSession(
  userId: number,
  priceId: string,
  customerEmail: string,
  customerName?: string
): Promise<string> {
  const stripe = getStripe()
  const customerId = await getOrCreateCustomer(userId, customerEmail, customerName)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings?checkout=cancelled`,
    metadata: { userId: String(userId) },
    allow_promotion_codes: true,
  })

  return session.url!
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 */
export async function createPortalSession(stripeCustomerId: string): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings`,
  })
  return session.url
}
