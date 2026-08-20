import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", request.url))
  }

  const user = await db.user.findFirst({
    where: { verificationToken: token },
  })

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", request.url))
  }

  if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
    return NextResponse.redirect(new URL("/login?error=token-expired", request.url))
  }

  // Mark email as verified
  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  })

  await db.securityAuditLog.create({
    data: {
      userId: user.id,
      action: "email_verified",
    },
  })

  // Welcome them now rather than at registration, so it doesn't arrive
  // alongside the verification email. Never block verification on it.
  const welcome = await sendWelcomeEmail(user.email, user.fullName || undefined)
  if (!welcome.success) {
    console.error(`Welcome email failed for user ${user.id}:`, welcome.error)
  }

  return NextResponse.redirect(new URL("/login?verified=true", request.url))
}
