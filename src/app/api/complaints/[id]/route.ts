import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { complaintUpdateSchema } from "@/lib/validations"
import { incrementEmailSendCount } from "@/lib/subscription"
import { sendComplaintEmail, getReplyToAddress } from "@/lib/email"

// GET /api/complaints/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const complaint = await db.complaint.findFirst({
      where: { id: parseInt(id) },
      include: {
        issue: {
          select: {
            id: true,
            userId: true,
            issueType: true,
            organization: true,
            issueCategory: true,
          },
        },
      },
    })

    if (!complaint || complaint.issue.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(complaint)
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 500 })
  }
}

// PATCH /api/complaints/[id] — update complaint (edit text, mark as sent, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = complaintUpdateSchema.parse(body)

    // Verify ownership — include issue details for email subject line
    const existing = await db.complaint.findFirst({
      where: { id: parseInt(id) },
      include: {
        issue: {
          select: { userId: true, id: true, issueType: true, organization: true },
        },
      },
    })

    if (!existing || existing.issue.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (validated.complaintText) updateData.complaintText = validated.complaintText
    if (validated.recipientName) updateData.recipientName = validated.recipientName
    if (validated.recipientEmail) updateData.recipientEmail = validated.recipientEmail
    if (validated.recipientAddress) updateData.recipientAddress = validated.recipientAddress
    if (validated.recipientOrg) updateData.recipientOrg = validated.recipientOrg

    if (validated.status === "sent") {
      // Statement of truth must be confirmed before sending
      if (!validated.truthConfirmed) {
        return NextResponse.json(
          { error: "You must confirm the statement of truth before sending" },
          { status: 400 }
        )
      }

      // Attempt to send via email if recipient email is available
      const recipientEmail = validated.recipientEmail || existing.recipientEmail
      const complaintText = validated.complaintText || existing.complaintText

      if (recipientEmail && process.env.RESEND_API_KEY) {
        // Get user profile for sender details
        const user = await db.user.findUnique({
          where: { id: parseInt(session.user.id) },
          select: { fullName: true, email: true },
        })

        // Build CC list from complaint's ccRecipients
        const ccEmails = (existing.ccRecipients as Array<{ email?: string }>)
          ?.map((r) => r.email)
          .filter(Boolean) as string[] || []

        const subject = `Formal Complaint: ${existing.issue.issueType} — ${existing.issue.organization || "Your Organisation"}`

        const emailResult = await sendComplaintEmail({
          complaintId: existing.id,
          to: recipientEmail,
          cc: ccEmails,
          subject,
          body: complaintText,
          senderName: user?.fullName || "CivicShield User",
          senderEmail: user?.email || "",
        })

        if (!emailResult.success) {
          return NextResponse.json(
            { error: `Failed to send email: ${emailResult.error}` },
            { status: 500 }
          )
        }

        updateData.sentVia = "email"
        updateData.replyToAddress = getReplyToAddress(existing.id)
      } else {
        // No email configured or no recipient email — mark as manually sent
        updateData.sentVia = "manual"
      }

      updateData.status = "sent"
      updateData.sentAt = new Date()
      updateData.truthConfirmedAt = new Date()

      // Update the parent issue
      await db.issue.update({
        where: { id: existing.issue.id },
        data: { complaintSent: true },
      })

      // Increment lifetime send count for free tier tracking
      await incrementEmailSendCount(parseInt(session.user.id))
    } else if (validated.status) {
      updateData.status = validated.status
    }

    const complaint = await db.complaint.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error("Error updating complaint:", error)
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 })
  }
}

// DELETE /api/complaints/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.complaint.findFirst({
      where: { id: parseInt(id) },
      include: { issue: { select: { userId: true } } },
    })

    if (!existing || existing.issue.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await db.complaint.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    console.error("Error deleting complaint:", error)
    return NextResponse.json({ error: "Failed to delete complaint" }, { status: 500 })
  }
}
