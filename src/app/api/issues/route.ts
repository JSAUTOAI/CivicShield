import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { issueSchema } from "@/lib/validations"

// GET /api/issues — list user's issues
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const issues = await db.issue.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        complaints: {
          select: { id: true, status: true, sentAt: true },
        },
        legalAnalysis: {
          select: { id: true },
        },
        _count: {
          select: { evidenceItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(issues)
  } catch (error) {
    console.error("Error fetching issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

// POST /api/issues — create a new issue
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = issueSchema.parse(body)

    const issue = await db.issue.create({
      data: {
        userId: parseInt(session.user.id),
        issueCategory: validated.issueCategory,
        issueType: validated.issueType,
        description: validated.description,
        organization: validated.organization,
        individual: validated.individual || null,
        dateOfIncident: validated.dateOfIncident,
        timeOfIncident: validated.timeOfIncident || null,
        location: validated.location,
        userRole: validated.userRole,
        isAnonymous: validated.isAnonymous,
        status: "in_progress",
        evidence: [],
      },
    })

    // Create change history entry
    await db.issueChangeHistory.create({
      data: {
        issueId: issue.id,
        fieldName: "status",
        newValue: "created",
        changedBy: parseInt(session.user.id),
        changeType: "create",
      },
    })

    return NextResponse.json(issue, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> }
      return NextResponse.json(
        { error: "Validation failed", details: zodError.issues.map((i) => ({ field: i.path.join("."), message: i.message })) },
        { status: 400 }
      )
    }

    console.error("Error creating issue:", error)
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
