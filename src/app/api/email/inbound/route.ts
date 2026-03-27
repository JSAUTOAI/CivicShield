import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { parseReplyToAddress } from "@/lib/email"

/**
 * POST /api/email/inbound
 *
 * Receives inbound emails from Resend's webhook.
 * When an organisation replies to a complaint, Resend forwards
 * the email to this endpoint because the reply-to address
 * (reply+{complaintId}@civicshield.co.uk) is configured for inbound processing.
 *
 * Resend inbound webhook payload:
 * https://resend.com/docs/dashboard/webhooks/introduction
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Resend sends different event types — we care about "email.received"
    // The payload structure depends on Resend's inbound email format
    const to = body.to || body.data?.to
    const from = body.from || body.data?.from
    const subject = body.subject || body.data?.subject
    const text = body.text || body.data?.text || body.html || body.data?.html || ""

    if (!to) {
      return NextResponse.json({ error: "Missing recipient" }, { status: 400 })
    }

    // Parse the complaint ID from the reply-to address
    // The "to" field could be an array or string
    const toAddresses = Array.isArray(to) ? to : [to]
    let complaintId: number | null = null

    for (const addr of toAddresses) {
      const address = typeof addr === "string" ? addr : addr?.address || addr?.email || ""
      complaintId = parseReplyToAddress(address)
      if (complaintId) break
    }

    if (!complaintId) {
      // Not a complaint reply — might be a general email
      console.log("Inbound email not matched to a complaint:", toAddresses)
      return NextResponse.json({ received: true, matched: false })
    }

    // Find the complaint
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, status: true, respondedAt: true },
    })

    if (!complaint) {
      console.log("Complaint not found for inbound email:", complaintId)
      return NextResponse.json({ received: true, matched: false })
    }

    // Store the response
    const senderAddress = typeof from === "string" ? from : from?.address || from?.email || "Unknown sender"
    const responseContent = typeof text === "string"
      ? text
      : "Response received (see original email for full content)"

    await db.complaint.update({
      where: { id: complaintId },
      data: {
        respondedAt: complaint.respondedAt || new Date(), // Only set first response time
        responseText: responseContent.substring(0, 10000), // Limit stored text
        status: "responded",
      },
    })

    console.log(`Inbound reply stored for complaint ${complaintId} from ${senderAddress}`)

    return NextResponse.json({ received: true, matched: true, complaintId })
  } catch (error) {
    console.error("Inbound email webhook error:", error)
    return NextResponse.json({ error: "Failed to process inbound email" }, { status: 500 })
  }
}
