import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { resetPasswordSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    const user = await db.user.findFirst({
      where: { resetPasswordToken: token },
    })

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Cost 12 matches /api/auth/register and /api/settings/password
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        // Completing a reset also clears any lockout — otherwise a user who
        // locked themselves out by guessing still can't get in.
        failedLoginAttempts: 0,
        accountLocked: false,
        accountLockedUntil: null,
      },
    })

    await db.passwordHistory.create({
      data: { userId: user.id, passwordHash: hashedPassword },
    })

    await db.securityAuditLog.create({
      data: { userId: user.id, action: "password_reset_completed" },
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
