import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { auth } from "@/lib/auth"

// POST /api/petitions/:id/sign — sign a petition
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401)
    }

    const { id } = await params
    const petitionId = parseInt(id)
    const userId = parseInt(session.user.id)

    // Check petition exists
    const petition = await db.petition.findUnique({ where: { id: petitionId } })
    if (!petition) {
      return apiError("Petition not found", 404)
    }

    // Check for duplicate signature
    const existing = await db.signature.findFirst({
      where: { petitionId, userId },
    })
    if (existing) {
      return apiError("You have already signed this petition", 409)
    }

    // Create signature and increment count
    await db.$transaction([
      db.signature.create({
        data: {
          petitionId,
          userId,
          isAnonymous: false,
        },
      }),
      db.petition.update({
        where: { id: petitionId },
        data: { currentCount: { increment: 1 } },
      }),
    ])

    return apiSuccess({ signed: true })
  } catch (error) {
    console.error("Error signing petition:", error)
    return apiError("Failed to sign petition")
  }
}
