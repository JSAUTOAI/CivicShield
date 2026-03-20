"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/layout/logo"
import { Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement actual auth
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 lg:hidden">
        <Logo size="lg" />
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-xs">
        <CardHeader className="space-y-1 px-0 lg:px-6">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your CivicShield account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 lg:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                icon={<Lock className="h-4 w-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full gap-2"
              loading={loading}
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Create one free
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
