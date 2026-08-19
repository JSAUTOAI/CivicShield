import { Webhook } from "svix"

export type WebhookVerification =
  | { ok: true; verified: boolean }
  | { ok: false; reason: string }

/**
 * Verify a Resend webhook's Svix signature.
 *
 * Pass the RAW request body — `await request.text()`, before any JSON parsing.
 * Signatures are computed over the exact bytes sent, so re-serialising a parsed
 * object will not match.
 *
 * If RESEND_WEBHOOK_SECRET is not set we fall back to the previous behaviour
 * (require the three svix headers to be present) rather than rejecting, because
 * hard-failing would silently kill reply and open tracking on any deployment
 * where the secret hasn't been configured yet. That fallback is NOT secure —
 * anyone who sends three header names passes it — so the missing secret is
 * logged loudly on every request. Set it in .env and in Vercel to close this.
 *
 * `verified` in the success case tells the caller which path was taken.
 */
export function verifyResendWebhook(
  rawBody: string,
  headers: Headers
): WebhookVerification {
  const svixId = headers.get("svix-id")
  const svixTimestamp = headers.get("svix-timestamp")
  const svixSignature = headers.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { ok: false, reason: "Missing webhook signature headers" }
  }

  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.warn(
      "[webhook] RESEND_WEBHOOK_SECRET is not set — accepting this webhook on " +
        "header presence alone. This is spoofable. Set the secret from the " +
        "Resend dashboard in .env and in Vercel."
    )
    return { ok: true, verified: false }
  }

  try {
    new Webhook(secret).verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    })
    return { ok: true, verified: true }
  } catch (error) {
    console.error("[webhook] Signature verification failed:", (error as Error).message)
    return { ok: false, reason: "Invalid webhook signature" }
  }
}
