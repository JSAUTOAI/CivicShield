import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { auth } from "@/lib/auth"

// GET /api/petitions — list live petitions with signature counts.
// Drafts are excluded: they're unpublished and shouldn't be signable.
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    const petitions = await db.petition.findMany({
      where: { status: { not: "draft" } },
      include: {
        _count: { select: { signatures: true } },
        // Only the current user's signature, so the UI knows whether to
        // offer "Sign" or show it as already signed. -1 never matches,
        // which keeps this empty for signed-out visitors.
        signatures: { where: { userId: userId ?? -1 }, select: { id: true }, take: 1 },
      },
      orderBy: [{ isTrending: "desc" }, { createdAt: "desc" }],
    })

    return apiSuccess(
      petitions.map(({ signatures, _count, ...p }) => ({
        ...p,
        // Count the signature rows rather than trusting the denormalised
        // `currentCount` column — legacy rows carried over from the original
        // Replit database have signatures but a currentCount of 0.
        signatureCount: _count.signatures,
        hasSigned: signatures.length > 0,
      }))
    )
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
