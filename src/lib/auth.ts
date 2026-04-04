import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://")
const cookieDomain = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL).hostname
  : undefined

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: useSecureCookies ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        domain: cookieDomain?.startsWith("www.") ? cookieDomain.slice(4) : cookieDomain,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user) {
          return null
        }

        // Check if account is locked
        if (user.accountLocked) {
          if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
            throw new Error("Account is temporarily locked. Please try again later.")
          }
          // Unlock if lock period has expired
          await db.user.update({
            where: { id: user.id },
            data: {
              accountLocked: false,
              accountLockedUntil: null,
              failedLoginAttempts: 0,
            },
          })
        }

        const passwordValid = await bcrypt.compare(password, user.password)

        if (!passwordValid) {
          // Track failed attempts
          const attempts = user.failedLoginAttempts + 1
          const lockAccount = attempts >= 5

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              accountLocked: lockAccount,
              accountLockedUntil: lockAccount
                ? new Date(Date.now() + 30 * 60 * 1000) // 30 min lock
                : null,
            },
          })

          // Audit log
          await db.securityAuditLog.create({
            data: {
              userId: user.id,
              action: "failed_login",
              details: { attempts, locked: lockAccount },
            },
          })

          if (lockAccount) {
            throw new Error("Too many failed attempts. Account locked for 30 minutes.")
          }

          return null
        }

        // Successful login — reset failed attempts
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            accountLocked: false,
            accountLockedUntil: null,
            lastLogin: new Date(),
          },
        })

        await db.securityAuditLog.create({
          data: {
            userId: user.id,
            action: "login_success",
          },
        })

        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName || user.username,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role || "user"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
})
