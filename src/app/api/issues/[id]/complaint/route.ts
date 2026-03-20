import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// POST /api/issues/[id]/complaint — regenerate complaint
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const issueId = parseInt(id)

    const issue = await db.issue.findFirst({
      where: {
        id: issueId,
        userId: parseInt(session.user.id),
      },
      include: {
        legalAnalysis: { take: 1, orderBy: { createdAt: "desc" } },
      },
    })

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    // Re-analyze and regenerate complaint
    const { analyzeIssue } = await import("@/lib/ai-analysis")
    const analysis = await analyzeIssue({
      issueCategory: issue.issueCategory,
      issueType: issue.issueType,
      description: issue.description,
      organization: issue.organization,
      individual: issue.individual,
      dateOfIncident: issue.dateOfIncident,
      timeOfIncident: issue.timeOfIncident,
      location: issue.location,
      userRole: issue.userRole,
    })

    const complaint = await db.complaint.create({
      data: {
        issueId: issue.id,
        complaintText: analysis.complaintText,
        recipientName: analysis.complaintRecipient.name,
        recipientOrg: analysis.complaintRecipient.organization,
        recipientAddress: analysis.complaintRecipient.address,
        recipientEmail: analysis.complaintRecipient.email || null,
        ccRecipients: analysis.ccRecipients.map((cc) => ({
          name: cc.name,
          organization: cc.organization,
          role: cc.role,
        })),
        status: "draft",
      },
    })

    await db.issue.update({
      where: { id: issue.id },
      data: { hasComplaint: true },
    })

    return NextResponse.json({ complaint, analysis })
  } catch (error) {
    console.error("Complaint generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate complaint" },
      { status: 500 }
    )
  }
}
