import { NextResponse } from "next/server"
import { getStripe, getTierFromPriceId } from "@/lib/stripe"
import { db } from "@/lib/db"
import type Stripe from "stripe"

/**
 * Extract the period end from a subscription's first item.
 */
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const item = subscription.items.data[0]
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000)
  }
  return null
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId)

        await db.user.update({
          where: { id: parseInt(userId) },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: "active",
            stripeSubscriptionId: subscription.id,
            subscriptionExpiresAt: getSubscriptionPeriodEnd(subscription),
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        const priceId = subscription.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId)
        const status = subscription.status === "active" ? "active" : "past_due"

        await db.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: status,
            subscriptionExpiresAt: getSubscriptionPeriodEnd(subscription),
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        await db.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier: "free",
            subscriptionStatus: "cancelled",
            stripeSubscriptionId: null,
            subscriptionExpiresAt: null,
          },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        await db.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: "past_due" },
        })
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!user) break

        // In Stripe v20+, subscription info is under parent.subscription_details
        const subDetails = invoice.parent?.subscription_details
        const subRef = subDetails?.subscription
        if (subRef) {
          const subscriptionId = typeof subRef === "string" ? subRef : subRef.id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await db.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "active",
              subscriptionExpiresAt: getSubscriptionPeriodEnd(subscription),
            },
          })
        }
        break
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
