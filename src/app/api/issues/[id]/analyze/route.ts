import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analyzeIssue } from "@/lib/ai-analysis"
import { checkComplaintLimit, checkFollowUpLimit, isFollowUp } from "@/lib/subscription"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { id } = await params
    const issueId = parseInt(id)

    // Check if this is a follow-up or new complaint
    const followUp = await isFollowUp(issueId)

    if (followUp) {
      // Find the most recent sent complaint for this issue to check follow-up limits
      const existingComplaint = await db.complaint.findFirst({
        where: { issueId, status: "sent" },
        orderBy: { createdAt: "desc" },
      })
      if (existingComplaint) {
        const followUpCheck = await checkFollowUpLimit(existingComplaint.id, userId)
        if (!followUpCheck.allowed) {
          return NextResponse.json(
            { error: followUpCheck.message, limitReached: true, type: "follow_up" },
            { status: 403 }
          )
        }
      }
    } else {
      // New complaint — check complaint limit
      const limitCheck = await checkComplaintLimit(userId)
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: limitCheck.message, limitReached: true, type: "complaint", usage: { used: limitCheck.used, limit: limitCheck.limit, tier: limitCheck.tier } },
          { status: 403 }
        )
      }
    }

    // Fetch the issue and user profile
    const [issue, user] = await Promise.all([
      db.issue.findFirst({
        where: {
          id: issueId,
          userId,
        },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: { fullName: true, email: true, address: true, phone: true },
      }),
    ])

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    // Run AI analysis with user's profile details for the complaint
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
      complainantName: issue.isAnonymous ? null : user?.fullName,
      complainantEmail: issue.isAnonymous ? null : user?.email,
      complainantAddress: issue.isAnonymous ? null : user?.address,
      complainantPhone: issue.isAnonymous ? null : user?.phone,
      organizationMetadata: issue.organizationMetadata as Record<string, string | null> | null,
    })

    // Store the analysis
    const legalAnalysis = await db.legalAnalysis.create({
      data: {
        issueId: issue.id,
        relevantLaws: analysis.legislation.map((l) => ({
          actTitle: l.actTitle,
          description: l.description,
          legalDeclaration: l.legalDeclaration,
          url: l.url,
        })),
        rightViolations: analysis.rightsViolations.map((v) => ({
          type: v.type,
          description: v.description,
          legalResponse: v.legalResponse,
          severity: v.severity,
        })),
        recommendedActions: analysis.recommendedActions.map((a) => ({
          title: a.title,
          description: a.description,
          priority: a.priority,
          actionUrl: a.actionUrl,
        })),
        precedents: analysis.precedents.map((p) => ({
          caseName: p.caseName,
          caseReference: p.caseReference,
          court: p.court,
          courtLevel: p.courtLevel,
          keyPrinciple: p.keyPrinciple,
          relevance: p.relevance,
          legalDeclaration: p.legalDeclaration,
          isBinding: p.isBinding,
          caseUrl: p.caseUrl,
        })),
      },
    })

    // Auto-generate complaint and save as draft
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
        isFollowUp: followUp,
      },
    })

    // If follow-up, increment the follow-up count on the parent complaint
    if (followUp) {
      const parentComplaint = await db.complaint.findFirst({
        where: { issueId, status: "sent" },
        orderBy: { createdAt: "desc" },
      })
      if (parentComplaint) {
        await db.complaint.update({
          where: { id: parentComplaint.id },
          data: { followUpCount: { increment: 1 } },
        })
      }
    }

    // Update issue status
    await db.issue.update({
      where: { id: issue.id },
      data: { hasComplaint: true },
    })

    return NextResponse.json({
      analysis: legalAnalysis,
      complaint,
      result: analysis,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    const message = (error as Error).message || ""

    if (message.includes("overloaded") || message.includes("529")) {
      return NextResponse.json(
        { error: "AI servers are currently experiencing delays. Please try again in a few minutes.", retryExhausted: true },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Failed to analyze issue" },
      { status: 500 }
    )
  }
}
