import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { z } from "zod"

const profileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  emailNotifications: z.boolean().optional(),
  anonymousDefault: z.boolean().optional(),
})

// GET /api/settings/profile
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        theme: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        emailNotifications: true,
        anonymousDefault: true,
        createdAt: true,
      },
    })

    if (!user) return apiError("User not found", 404)

    return apiSuccess(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return apiError("Failed to fetch profile", 500)
  }
}

// PATCH /api/settings/profile
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await request.json()
    const validated = profileSchema.parse(body)

    const user = await db.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        ...(validated.fullName !== undefined && { fullName: validated.fullName }),
        ...(validated.phone !== undefined && { phone: validated.phone }),
        ...(validated.address !== undefined && { address: validated.address }),
        ...(validated.emailNotifications !== undefined && { emailNotifications: validated.emailNotifications }),
        ...(validated.anonymousDefault !== undefined && { anonymousDefault: validated.anonymousDefault }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
      },
    })

    return apiSuccess(user)
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return apiError("Validation failed", 400)
    }
    console.error("Error updating profile:", error)
    return apiError("Failed to update profile", 500)
  }
}
