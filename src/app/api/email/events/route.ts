import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * POST /api/email/events
 *
 * Receives outbound email event notifications from Resend's webhook
 * (email.delivered, email.opened, email.bounced, etc).
 *
 * Separate from /api/email/inbound, which handles inbound replies.
 *
 * Resend webhook payload format:
 * https://resend.com/docs/dashboard/webhooks/event-types
 *
 * Each outbound complaint send attaches a tag `complaint_id` so we can
 * correlate events back to the originating Complaint row.
 */

type ResendEventPayload = {
  type?: string
  data?: {
    email_id?: string
    tags?: Array<{ name?: string; value?: string }>
  }
}

function extractComplaintId(payload: ResendEventPayload): number | null {
  const tag = payload.data?.tags?.find((t) => t?.name === "complaint_id")
  if (!tag?.value) return null
  const id = parseInt(tag.value, 10)
  return Number.isFinite(id) ? id : null
}

export async function POST(request: Request) {
  try {
    // Resend includes svix-* headers for signature verification.
    // Cryptographic verification is handled in STEP 5; for now we require
    // the headers to be present as a minimal guard.
    const svixId = request.headers.get("svix-id")
    const svixTimestamp = request.headers.get("svix-timestamp")
    const svixSignature = request.headers.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing webhook signature headers" },
        { status: 401 }
      )
    }

    const payload = (await request.json()) as ResendEventPayload
    const eventType = payload.type
    const complaintId = extractComplaintId(payload)

    if (!eventType) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 })
    }

    if (!complaintId) {
      // Event without a complaint_id tag (e.g. verification emails) — ack and ignore.
      console.log(`Email event ${eventType} without complaint_id tag — ignoring`)
      return NextResponse.json({ received: true, matched: false })
    }

    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, status: true, openedAt: true, respondedAt: true },
    })

    if (!complaint) {
      console.log(`Email event for unknown complaint ${complaintId}`)
      return NextResponse.json({ received: true, matched: false })
    }

    switch (eventType) {
      case "email.opened": {
        // Only record the first open, and only advance status if we haven't
        // already received a reply (replied > opened in the journey).
        const update: Record<string, unknown> = {}
        if (!complaint.openedAt) update.openedAt = new Date()
        if (complaint.status === "sent") update.status = "opened"
        if (Object.keys(update).length > 0) {
          await db.complaint.update({ where: { id: complaintId }, data: update })
        }
        break
      }
      case "email.delivered":
      case "email.bounced":
      case "email.complained":
      case "email.delivery_delayed":
        // Informational — logged for now, can be surfaced in UI later.
        console.log(`Email event ${eventType} for complaint ${complaintId}`)
        break
      default:
        // Unknown event type — ack so Resend doesn't retry.
        console.log(`Unhandled email event type: ${eventType}`)
    }

    return NextResponse.json({ received: true, matched: true, complaintId })
  } catch (error) {
    console.error("Email event webhook error:", error)
    return NextResponse.json(
      { error: "Failed to process email event" },
      { status: 500 }
    )
  }
}
