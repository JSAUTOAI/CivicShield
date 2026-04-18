import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    // Don't reveal if user exists or not
    if (!user || user.emailVerified) {
      return NextResponse.json({
        message: "If an account exists with that email, a verification link has been sent.",
      })
    }

    // Rate limit: check if last verification was sent less than 2 minutes ago
    if (user.verificationTokenExpires) {
      const lastSentAt = new Date(user.verificationTokenExpires.getTime() - 24 * 60 * 60 * 1000)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
      if (lastSentAt > twoMinutesAgo) {
        return NextResponse.json(
          { error: "Please wait before requesting another verification email." },
          { status: 429 }
        )
      }
    }

    // Generate new token
    const verificationToken = randomBytes(32).toString("hex")
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires,
      },
    })

    await sendVerificationEmail(email, verificationToken, user.fullName || undefined)

    return NextResponse.json({
      message: "If an account exists with that email, a verification link has been sent.",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
