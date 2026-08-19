import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { forgotPasswordSchema } from "@/lib/validations"

// Same wording is returned whether or not the account exists, so this
// endpoint can't be used to enumerate registered email addresses.
const GENERIC_RESPONSE = {
  message: "If an account exists with that email, a password reset link has been sent.",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email address" },
        { status: 400 }
      )
    }

    const { email } = parsed.data
    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE)
    }

    // Rate limit: refuse if a still-valid token was issued in the last 2 minutes.
    // Tokens live for 1 hour, so anything expiring more than 58 minutes out is fresh.
    if (user.resetPasswordExpires) {
      const issuedAt = new Date(user.resetPasswordExpires.getTime() - 60 * 60 * 1000)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
      if (issuedAt > twoMinutesAgo) {
        return NextResponse.json(
          { error: "Please wait before requesting another reset email." },
          { status: 429 }
        )
      }
    }

    const resetPasswordToken = randomBytes(32).toString("hex")
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpires },
    })

    await db.securityAuditLog.create({
      data: { userId: user.id, action: "password_reset_requested" },
    })

    const result = await sendPasswordResetEmail(email, resetPasswordToken)
    if (!result.success) {
      console.error("Failed to send password reset email:", result.error)
    }

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
