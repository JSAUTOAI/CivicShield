import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validations"

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

    // Create user
    const user = await db.user.create({
      data: {
        username: validated.username,
        email: validated.email,
        password: hashedPassword,
        fullName: validated.fullName,
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

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user.id, email: user.email, username: user.username },
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
