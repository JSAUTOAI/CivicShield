import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { auth } from "@/lib/auth"

// GET /api/petitions — list petitions with signature counts
export async function GET() {
  try {
    const petitions = await db.petition.findMany({
      include: {
        _count: { select: { signatures: true } },
      },
      orderBy: [{ isTrending: "desc" }, { createdAt: "desc" }],
    })

    return apiSuccess(petitions)
  } catch (error) {
    console.error("Error fetching petitions:", error)
    return apiError("Failed to fetch petitions")
  }
}

// POST /api/petitions — create a new petition
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401)
    }

    const body = await request.json()
    const { title, description, category, targetOrg, targetCount } = body

    if (!title || !description) {
      return apiError("Title and description are required", 400)
    }

    const petition = await db.petition.create({
      data: {
        title,
        description,
        category: category || null,
        targetOrg: targetOrg || null,
        targetCount: targetCount || 1000,
        createdBy: parseInt(session.user.id),
        status: "active",
      },
    })

    return apiSuccess(petition, 201)
  } catch (error) {
    console.error("Error creating petition:", error)
    return apiError("Failed to create petition")
  }
}
