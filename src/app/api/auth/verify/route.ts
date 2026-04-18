import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { db } from "@/lib/db"

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

  return NextResponse.redirect(new URL("/login?verified=true", request.url))
}
