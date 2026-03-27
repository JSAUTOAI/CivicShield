import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/cases — list user's cases
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cases = await db.legalCase.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        _count: {
          select: {
            courtDocuments: true,
            caseTimeline: true,
            casePreparationTasks: true,
          },
        },
        issue: {
          select: {
            id: true,
            issueType: true,
            organization: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(cases)
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

// POST /api/cases — create a case from an issue
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { issueId, caseTitle, caseType } = body

    if (!issueId || !caseTitle || !caseType) {
      return NextResponse.json(
        { error: "Missing required fields: issueId, caseTitle, caseType" },
        { status: 400 }
      )
    }

    // Verify issue ownership
    const issue = await db.issue.findFirst({
      where: { id: issueId, userId },
      include: {
        legalAnalysis: true,
      },
    })

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    // Create the case with all related records in a transaction
    const legalCase = await db.$transaction(async (tx) => {
      // Create the case
      const newCase = await tx.legalCase.create({
        data: {
          issueId,
          userId,
          caseTitle,
          caseType,
          caseStatus: "preparation",
        },
      })

      // Auto-populate from legal analysis if available
      const analysis = issue.legalAnalysis?.[0]

      if (analysis) {
        // Create LegalPrecedent records from analysis.precedents
        if (analysis.precedents && Array.isArray(analysis.precedents) && analysis.precedents.length > 0) {
          for (const precedent of analysis.precedents) {
            const p = precedent as Record<string, unknown>
            await tx.legalPrecedent.create({
              data: {
                caseId: newCase.id,
                caseName: (p.caseName as string) || (p.name as string) || "Unknown",
                caseReference: (p.caseReference as string) || (p.reference as string) || (p.citation as string) || "N/A",
                court: (p.court as string) || "Unknown",
                parties: (p.parties as string) || "Unknown",
                legalPrinciple: (p.legalPrinciple as string) || (p.principle as string) || (p.summary as string) || "",
                relevanceToCase: (p.relevanceToCase as string) || (p.relevance as string) || "",
                precedentStrength: (p.precedentStrength as string) || (p.strength as string) || "medium",
              },
            })
          }
        }

        // Create RelevantLegislation records from analysis.relevantLaws
        if (analysis.relevantLaws && Array.isArray(analysis.relevantLaws) && analysis.relevantLaws.length > 0) {
          for (const law of analysis.relevantLaws) {
            const l = law as Record<string, unknown>
            await tx.relevantLegislation.create({
              data: {
                caseId: newCase.id,
                actTitle: (l.actTitle as string) || (l.title as string) || (l.name as string) || "Unknown",
                actYear: l.actYear ? Number(l.actYear) : (l.year ? Number(l.year) : null),
                relevantProvisions: (l.relevantProvisions as string) || (l.provisions as string) || (l.description as string) || null,
                applicationToCase: (l.applicationToCase as string) || (l.application as string) || (l.relevance as string) || null,
                legislationType: (l.legislationType as string) || (l.type as string) || "primary",
                jurisdiction: (l.jurisdiction as string) || "England and Wales",
              },
            })
          }
        }

        // Create RightsViolation records from analysis.rightViolations
        if (analysis.rightViolations && Array.isArray(analysis.rightViolations) && analysis.rightViolations.length > 0) {
          for (const violation of analysis.rightViolations) {
            const v = violation as Record<string, unknown>
            await tx.rightsViolation.create({
              data: {
                caseId: newCase.id,
                violationType: (v.violationType as string) || (v.type as string) || "Unknown",
                description: (v.description as string) || (v.summary as string) || "",
                severity: (v.severity as string) || "medium",
                legislationBreach: (v.legislationBreach as string) || (v.breach as string) || null,
                proofStrength: (v.proofStrength as string) || (v.strength as string) || "medium",
                remedySought: (v.remedySought as string) || (v.remedy as string) || null,
              },
            })
          }
        }
      }

      // Create initial timeline entry
      await tx.caseTimeline.create({
        data: {
          caseId: newCase.id,
          eventType: "filing",
          eventTitle: "Case opened",
          eventDescription: `Case "${caseTitle}" created from issue #${issueId}`,
          eventDate: new Date(),
          importance: "high",
          isCompleted: true,
        },
      })

      // Create default preparation tasks
      const defaultTasks = [
        { taskCategory: "evidence_gathering", taskTitle: "Gather supporting evidence", priority: "high" },
        { taskCategory: "legal_research", taskTitle: "Review complaint and AI analysis", priority: "high" },
        { taskCategory: "witness_prep", taskTitle: "Identify potential witnesses", priority: "medium" },
        { taskCategory: "financial", taskTitle: "Calculate costs and damages", priority: "medium" },
      ]

      for (const task of defaultTasks) {
        await tx.casePreparationTask.create({
          data: {
            caseId: newCase.id,
            ...task,
          },
        })
      }

      // Return the case with all relations
      return tx.legalCase.findUnique({
        where: { id: newCase.id },
        include: {
          courtDocuments: true,
          caseTimeline: true,
          casePreparationTasks: true,
          legalPrecedents: true,
          relevantLegislation: true,
          rightsViolations: true,
          issue: {
            select: { id: true, issueType: true, organization: true },
          },
        },
      })
    })

    return NextResponse.json(legalCase, { status: 201 })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}
