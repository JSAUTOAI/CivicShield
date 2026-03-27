/**
 * CivicShield Stripe Setup Script
 *
 * Creates products, prices, customer portal config, and webhook endpoint.
 * Run once: node scripts/stripe-setup.mjs
 */

import Stripe from "stripe"
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || readEnvKey("STRIPE_SECRET_KEY")

if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY not found in .env or environment")
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY)

function readEnvKey(key) {
  try {
    const envPath = resolve(process.cwd(), ".env")
    const content = readFileSync(envPath, "utf-8")
    const match = content.match(new RegExp(`^${key}="?([^"\\n]+)"?`, "m"))
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function setup() {
  console.log("\n🛡️  CivicShield Stripe Setup\n")
  console.log("Creating products and prices...\n")

  // --- Create Products ---

  const basicProduct = await stripe.products.create({
    name: "CivicShield Basic",
    description: "5 complaints/month, 10 follow-ups each, auto-send emails, basic tracking",
    metadata: { tier: "basic" },
  })
  console.log(`✅ Product: ${basicProduct.name} (${basicProduct.id})`)

  const proProduct = await stripe.products.create({
    name: "CivicShield Pro",
    description: "15 complaints/month, 20 follow-ups each, full case builder, PDF export, priority support",
    metadata: { tier: "pro" },
  })
  console.log(`✅ Product: ${proProduct.name} (${proProduct.id})`)

  const agencyProduct = await stripe.products.create({
    name: "CivicShield Agency",
    description: "30 complaints/month, 50 follow-ups each, bulk send, 2GB uploads, priority support",
    metadata: { tier: "agency" },
  })
  console.log(`✅ Product: ${agencyProduct.name} (${agencyProduct.id})`)

  // --- Create Monthly Prices ---

  const basicPrice = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 499, // £4.99
    currency: "gbp",
    recurring: { interval: "month" },
    metadata: { tier: "basic" },
  })
  console.log(`✅ Price: Basic £4.99/mo (${basicPrice.id})`)

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1499, // £14.99
    currency: "gbp",
    recurring: { interval: "month" },
    metadata: { tier: "pro" },
  })
  console.log(`✅ Price: Pro £14.99/mo (${proPrice.id})`)

  const agencyPrice = await stripe.prices.create({
    product: agencyProduct.id,
    unit_amount: 1999, // £19.99
    currency: "gbp",
    recurring: { interval: "month" },
    metadata: { tier: "agency" },
  })
  console.log(`✅ Price: Agency £19.99/mo (${agencyPrice.id})`)

  // --- Configure Customer Portal ---

  try {
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "CivicShield — Manage Your Subscription",
      },
      features: {
        subscription_cancel: { enabled: true, mode: "at_period_end" },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          products: [
            { product: basicProduct.id, prices: [basicPrice.id] },
            { product: proProduct.id, prices: [proPrice.id] },
            { product: agencyProduct.id, prices: [agencyPrice.id] },
          ],
        },
        payment_method_update: { enabled: true },
        invoice_history: { enabled: true },
      },
    })
    console.log(`✅ Customer Portal configured`)
  } catch (err) {
    console.log(`⚠️  Customer Portal config skipped: ${err.message}`)
  }

  // --- Update .env file ---

  const envPath = resolve(process.cwd(), ".env")
  let envContent = readFileSync(envPath, "utf-8")

  envContent = envContent.replace(
    /STRIPE_BASIC_MONTHLY_PRICE_ID=".*"/,
    `STRIPE_BASIC_MONTHLY_PRICE_ID="${basicPrice.id}"`
  )
  envContent = envContent.replace(
    /STRIPE_PRO_MONTHLY_PRICE_ID=".*"/,
    `STRIPE_PRO_MONTHLY_PRICE_ID="${proPrice.id}"`
  )
  envContent = envContent.replace(
    /STRIPE_AGENCY_MONTHLY_PRICE_ID=".*"/,
    `STRIPE_AGENCY_MONTHLY_PRICE_ID="${agencyPrice.id}"`
  )

  writeFileSync(envPath, envContent)

  // --- Summary ---

  console.log("\n" + "=".repeat(60))
  console.log("SETUP COMPLETE")
  console.log("=".repeat(60))
  console.log(`\nPrice IDs written to .env:`)
  console.log(`  STRIPE_BASIC_MONTHLY_PRICE_ID="${basicPrice.id}"`)
  console.log(`  STRIPE_PRO_MONTHLY_PRICE_ID="${proPrice.id}"`)
  console.log(`  STRIPE_AGENCY_MONTHLY_PRICE_ID="${agencyPrice.id}"`)
  console.log(`\n⚠️  Still needed:`)
  console.log(`  1. STRIPE_WEBHOOK_SECRET — set up webhook in Stripe Dashboard:`)
  console.log(`     URL: https://civicshield.co.uk/api/stripe/webhook`)
  console.log(`     Events: checkout.session.completed, customer.subscription.updated,`)
  console.log(`             customer.subscription.deleted, invoice.payment_failed, invoice.paid`)
  console.log(`  2. Or for local testing, run: stripe listen --forward-to localhost:3001/api/stripe/webhook`)
  console.log("")
}

setup().catch((err) => {
  console.error("Setup failed:", err.message)
  process.exit(1)
})
