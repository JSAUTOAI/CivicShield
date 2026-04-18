import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validations"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email: validated.email },
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username: validated.username },
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex")
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await db.user.create({
      data: {
        username: validated.username,
        email: validated.email,
        password: hashedPassword,
        fullName: validated.fullName,
        phone: validated.phone,
        address: validated.address,
        verificationToken,
        verificationTokenExpires,
      },
    })

    // Store password in history
    await db.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: hashedPassword,
      },
    })

    // Audit log
    await db.securityAuditLog.create({
      data: {
        userId: user.id,
        action: "account_created",
      },
    })

    // Send verification email
    await sendVerificationEmail(validated.email, verificationToken, validated.fullName)

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      // Zod validation error
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> }
      return NextResponse.json(
        { error: "Validation failed", details: zodError.issues.map((i) => ({ field: i.path.join("."), message: i.message })) },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
