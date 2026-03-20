import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { complaintUpdateSchema } from "@/lib/validations"

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

    // Verify ownership
    const existing = await db.complaint.findFirst({
      where: { id: parseInt(id) },
      include: { issue: { select: { userId: true, id: true } } },
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
      updateData.status = "sent"
      updateData.sentAt = new Date()
      updateData.sentVia = "api"

      // Update the parent issue
      await db.issue.update({
        where: { id: existing.issue.id },
        data: { complaintSent: true },
      })
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
