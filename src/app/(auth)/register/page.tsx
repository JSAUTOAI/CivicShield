"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/layout/logo"
import { Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Full name
                </label>
                <Input
                  placeholder="Jake Smith"
                  icon={<User className="h-4 w-4" />}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Username
                </label>
                <Input placeholder="jakesmith" required />
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
                required
              />
              <div className="mt-2 space-y-1">
                {["At least 8 characters", "One uppercase letter", "One number or symbol"].map(
                  (req) => (
                    <p key={req} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-muted-foreground/50" />
                      {req}
                    </p>
                  )
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full gap-2"
              loading={loading}
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
