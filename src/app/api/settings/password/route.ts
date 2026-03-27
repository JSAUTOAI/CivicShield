import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import bcrypt from "bcryptjs"
import { z } from "zod"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9!@#$%^&*]/, "Password must contain at least one number or symbol"),
})

// PATCH /api/settings/password
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await request.json()
    const validated = passwordSchema.parse(body)

    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
    })

    if (!user) return apiError("User not found", 404)

    // Verify current password
    const valid = await bcrypt.compare(validated.currentPassword, user.password)
    if (!valid) return apiError("Current password is incorrect", 400)

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 12)

    // Update password and save to history
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await db.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: hashedPassword,
      },
    })

    await db.securityAuditLog.create({
      data: {
        userId: user.id,
        action: "password_change",
      },
    })

    return apiSuccess({ message: "Password updated successfully" })
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ message: string }> }
      return apiError(zodError.issues[0]?.message || "Validation failed", 400)
    }
    console.error("Error changing password:", error)
    return apiError("Failed to change password", 500)
  }
}
