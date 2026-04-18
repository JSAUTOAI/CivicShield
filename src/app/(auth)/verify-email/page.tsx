"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/layout/logo"
import { Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [resending, setResending] = React.useState(false)
  const [resendStatus, setResendStatus] = React.useState<"idle" | "success" | "error" | "cooldown">("idle")

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setResendStatus("idle")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setResendStatus("cooldown")
      } else if (!res.ok) {
        setResendStatus("error")
      } else {
        setResendStatus("success")
      }
    } catch {
      setResendStatus("error")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 lg:hidden">
        <Logo size="lg" />
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-xs">
        <CardHeader className="space-y-1 px-0 lg:px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
            <Mail className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your inbox</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to
            {email && (
              <span className="mt-1 block font-semibold text-foreground">{email}</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 lg:px-6 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Click the link in the email to verify your account. The link will expire in 24 hours.
          </p>

          {resendStatus === "success" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Verification email sent. Please check your inbox.
            </div>
          )}

          {resendStatus === "cooldown" && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Please wait a couple of minutes before requesting another email.
            </div>
          )}

          {resendStatus === "error" && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Something went wrong. Please try again.
            </div>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleResend}
            disabled={resending || !email}
            loading={resending}
          >
            <RefreshCw className="h-4 w-4" />
            Resend verification email
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already verified?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailContent />
    </React.Suspense>
  )
}
