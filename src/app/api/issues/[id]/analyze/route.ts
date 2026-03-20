import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { analyzeIssue } from "@/lib/ai-analysis"

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

    // Fetch the issue
    const issue = await db.issue.findFirst({
      where: {
        id: issueId,
        userId: parseInt(session.user.id),
      },
    })

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    // Run AI analysis
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

    // Store the analysis
    const legalAnalysis = await db.legalAnalysis.create({
      data: {
        issueId: issue.id,
        relevantLaws: analysis.legislation.map((l) => ({
          actTitle: l.actTitle,
          description: l.description,
          legalDeclaration: l.legalDeclaration,
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
      },
    })

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
    return NextResponse.json(
      { error: "Failed to analyze issue" },
      { status: 500 }
    )
  }
}
