import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"

// GET /api/issues/[id] — get single issue with all relations
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401)
    }

    const { id } = await params
    const issue = await db.issue.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(session.user.id),
      },
      include: {
        complaints: {
          orderBy: { createdAt: "desc" },
        },
        legalAnalysis: {
          orderBy: { createdAt: "desc" },
        },
        evidenceItems: {
          orderBy: { uploadedAt: "desc" },
        },
        issueChangeHistory: {
          orderBy: { changedAt: "desc" },
        },
        legalCases: {
          select: { id: true, caseTitle: true, caseStatus: true },
          take: 1,
        },
      },
    })

    if (!issue) {
      return apiError("Issue not found", 404)
    }

    return apiSuccess(issue)
  } catch (error) {
    console.error("Error fetching issue:", error)
    return apiError("Failed to fetch issue", 500)
  }
}
