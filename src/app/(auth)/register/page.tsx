"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/layout/logo"
import { Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [formData, setFormData] = React.useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  })

  const passwordChecks = [
    { label: "At least 8 characters", valid: formData.password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { label: "One number or symbol", valid: /[0-9!@#$%^&*]/.test(formData.password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) {
          setError(data.details.map((d: { message: string }) => d.message).join(". "))
        } else {
          setError(data.error || "Registration failed")
        }
        return
      }

      // Auto-login after registration
      router.push("/login?registered=true")
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 lg:hidden">
        <Logo size="lg" />
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-xs">
        <CardHeader className="space-y-1 px-0 lg:px-6">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Join CivicShield and start protecting your rights today
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 lg:px-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Full name
                </label>
                <Input
                  placeholder="Jake Smith"
                  icon={<User className="h-4 w-4" />}
                  value={formData.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  placeholder="jakesmith"
                  value={formData.username}
                  onChange={(e) => update("username", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email address
              </label>
              <Input
                type="email"
                placeholder="jake@example.com"
                icon={<Mail className="h-4 w-4" />}
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Create a strong password"
                icon={<Lock className="h-4 w-4" />}
                value={formData.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              <div className="mt-2 space-y-1">
                {passwordChecks.map((check) => (
                  <p
                    key={check.label}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <CheckCircle
                      className={`h-3 w-3 ${
                        check.valid
                          ? "text-emerald-500"
                          : "text-muted-foreground/40"
                      }`}
                    />
                    <span
                      className={
                        check.valid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      }
                    >
                      {check.label}
                    </span>
                  </p>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full gap-2"
              loading={loading}
              disabled={!passwordChecks.every((c) => c.valid)}
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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
