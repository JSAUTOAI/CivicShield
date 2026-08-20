import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateComplaintLetter, AnalysisRefusedError } from "@/lib/ai-analysis"
import { getEffectiveTier } from "@/lib/subscription"

/**
 * Writing the letter is the second half of the analysis, split out so neither
 * call exceeds the serverless request timeout. Combined they measured 46-239s;
 * Vercel's Hobby plan kills a request at 60s.
 */
export const maxDuration = 60

/**
 * POST /api/issues/[id]/complaint
 *
 * Writes the complaint letter for an issue that has already been analysed.
 * Fills in the draft created by /analyze; if that draft is missing (or the user
 * is regenerating) a fresh one is created from the stored analysis.
 *
 * Does NOT re-run the analysis — that is what made the combined call too slow,
 * and it would also double the cost of a regeneration.
 */
export async function POST(
  _request: Request,
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

    const issue = await db.issue.findFirst({
      where: { id: issueId, userId },
      include: {
        legalAnalysis: { take: 1, orderBy: { createdAt: "desc" } },
        complaints: { take: 1, orderBy: { createdAt: "desc" } },
      },
    })

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    const analysis = issue.legalAnalysis[0]
    if (!analysis) {
      return NextResponse.json(
        { error: "This issue hasn't been analysed yet. Run the analysis first." },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        email: true,
        address: true,
        phone: true,
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    })

    const draft = issue.complaints[0]

    const complaintText = await generateComplaintLetter({
      issue: {
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
        subscriptionTier: user
          ? getEffectiveTier(user.subscriptionTier ?? "free", user.subscriptionStatus)
          : "free",
      },
      analysis: {
        summary: "",
        // These columns are Json[] on LegalAnalysis; the shapes match what
        // /analyze wrote, so they can be handed straight back to the drafter.
        rightsViolations: (analysis.rightViolations ?? []) as never,
        legislation: (analysis.relevantLaws ?? []) as never,
        precedents: (analysis.precedents ?? []) as never,
        complaintRecipient: {
          name: draft?.recipientName || "The Complaints Manager",
          organization: draft?.recipientOrg || issue.organization,
          address: draft?.recipientAddress || "",
          email: draft?.recipientEmail || undefined,
        },
      },
    })

    // Fill in the empty draft rather than piling up rows; only create a new one
    // if there is nothing to fill (or the last one was already sent).
    const complaint =
      draft && !draft.complaintText && draft.status === "draft"
        ? await db.complaint.update({
            where: { id: draft.id },
            data: { complaintText },
          })
        : await db.complaint.create({
            data: {
              issueId: issue.id,
              complaintText,
              recipientName: draft?.recipientName ?? null,
              recipientOrg: draft?.recipientOrg ?? issue.organization,
              recipientAddress: draft?.recipientAddress ?? null,
              recipientEmail: draft?.recipientEmail ?? null,
              ccRecipients: (draft?.ccRecipients ?? []) as never,
              status: "draft",
            },
          })

    await db.issue.update({
      where: { id: issue.id },
      data: { hasComplaint: true },
    })

    return NextResponse.json({ complaint })
  } catch (error) {
    console.error("Complaint generation error:", error)

    if (error instanceof AnalysisRefusedError) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }

    if (error instanceof Anthropic.BadRequestError) {
      const detail = String(error.message || "")
      if (detail.toLowerCase().includes("credit balance")) {
        console.error(
          "ANTHROPIC CREDIT EXHAUSTED — letter drafting is down for every user " +
            "until the account is topped up at console.anthropic.com -> Plans & Billing."
        )
        return NextResponse.json(
          { error: "Letter drafting is temporarily unavailable. Your analysis has been saved — please try again shortly." },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: "Could not draft the letter. Your analysis has been saved — please try again." },
        { status: 502 }
      )
    }

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Could not draft the letter (${error.status}). Your analysis has been saved — please try again.`, retryExhausted: true },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Could not draft the letter. Your analysis has been saved — you can retry from this page." },
      { status: 500 }
    )
  }
}
