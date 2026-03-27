import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/cases/[id] — single case with all relations
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
    const caseId = parseInt(id)

    const legalCase = await db.legalCase.findFirst({
      where: { id: caseId, userId: parseInt(session.user.id) },
      include: {
        courtDocuments: true,
        caseTimeline: {
          orderBy: { eventDate: "desc" },
        },
        casePreparationTasks: {
          orderBy: { priority: "asc" },
        },
        legalPrecedents: true,
        relevantLegislation: true,
        rightsViolations: true,
        issue: {
          select: {
            id: true,
            issueType: true,
            issueCategory: true,
            organization: true,
            description: true,
            dateOfIncident: true,
            timeOfIncident: true,
            location: true,
            status: true,
            complaints: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                status: true,
                complaintText: true,
                sentAt: true,
                respondedAt: true,
                responseText: true,
                recipientOrg: true,
                recipientName: true,
                recipientEmail: true,
              },
            },
            legalAnalysis: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                relevantLaws: true,
                rightViolations: true,
                recommendedActions: true,
                precedents: true,
              },
            },
            evidenceItems: {
              select: {
                id: true,
                evidenceType: true,
                fileName: true,
                description: true,
                verificationStatus: true,
              },
            },
          },
        },
      },
    })

    if (!legalCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    return NextResponse.json(legalCase)
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 })
  }
}

// PATCH /api/cases/[id] — update case
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
    const caseId = parseInt(id)

    // Verify ownership
    const existing = await db.legalCase.findFirst({
      where: { id: caseId, userId: parseInt(session.user.id) },
    })

    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const body = await request.json()

    // Only allow updating specific fields
    const allowedFields = [
      "caseTitle",
      "caseNumber",
      "caseType",
      "courtLevel",
      "courtName",
      "caseStatus",
      "filedDate",
      "hearingDate",
      "caseOutcome",
      "outcomeDetails",
      "legalRepresentation",
      "estimatedCosts",
      "actualCosts",
      "caseStrength",
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Convert date strings to Date objects
        if ((field === "filedDate" || field === "hearingDate") && body[field]) {
          updateData[field] = new Date(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const updated = await db.legalCase.update({
      where: { id: caseId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 })
  }
}

// DELETE /api/cases/[id] — delete case (cascades handled by Prisma)
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
    const caseId = parseInt(id)

    // Verify ownership
    const existing = await db.legalCase.findFirst({
      where: { id: caseId, userId: parseInt(session.user.id) },
    })

    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    await db.legalCase.delete({
      where: { id: caseId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 })
  }
}
