/**
 * Break-glass password reset.
 *
 * Directly sets a user's password in the database, bypassing the app.
 * Use when a user (including you) is locked out and the self-serve
 * /forgot-password flow is unavailable.
 *
 * Usage:
 *   node --env-file=.env scripts/reset-password.mjs <email> <newPassword>
 *
 * Also clears the login lockout and marks the email verified, because
 * auth.ts refuses to sign in an account with emailVerified = false.
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Must match the cost used by /api/auth/register and /api/settings/password
const BCRYPT_ROUNDS = 12

const [email, newPassword] = process.argv.slice(2)

if (!email || !newPassword) {
  console.error("Usage: node --env-file=.env scripts/reset-password.mjs <email> <newPassword>")
  process.exit(1)
}

if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.")
  process.exit(1)
}

const db = new PrismaClient()

try {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true, emailVerified: true, accountLocked: true },
  })

  if (!user) {
    console.error(`No user found with email: ${email}`)
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  await db.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      emailVerified: true,
      failedLoginAttempts: 0,
      accountLocked: false,
      accountLockedUntil: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  })

  // Keep the audit trail honest — this was an out-of-band reset.
  await db.securityAuditLog.create({
    data: {
      userId: user.id,
      action: "password_reset_admin",
      details: { method: "reset-password.mjs", emailVerifiedSet: !user.emailVerified },
    },
  })

  console.log(`Password reset for ${user.email} (id ${user.id}, username "${user.username}")`)
  if (!user.emailVerified) console.log("  emailVerified was false — now set to true")
  if (user.accountLocked) console.log("  account was locked — now unlocked")
  console.log("  failed login attempts cleared")
} finally {
  await db.$disconnect()
}
