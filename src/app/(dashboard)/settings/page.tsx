"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { useTheme } from "@/components/layout/theme-provider"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Moon,
  Sun,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Save,
  Crown,
} from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={session?.user?.name || "User"} size="lg" />
              <div>
                <p className="text-base font-semibold">{session?.user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                <Badge variant="brand" className="mt-1">Free Plan</Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <Input
                  defaultValue={session?.user?.name || ""}
                  icon={<User className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  defaultValue={session?.user?.email || ""}
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <Input placeholder="Your phone number" icon={<Phone className="h-4 w-4" />} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Address</label>
                <Input placeholder="Your address" icon={<MapPin className="h-4 w-4" />} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="brand" className="gap-2" onClick={() => toast.success("Profile updated")}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-brand-600" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Current Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">New Password</label>
                <Input type="password" placeholder="New password" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Confirm Password</label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" className="gap-2" onClick={() => toast.success("Password updated")}>
                <Lock className="h-4 w-4" />
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-600" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  {theme === "light" ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-400" />}
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      Currently using {theme} mode
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  Switch to {theme === "light" ? "dark" : "light"}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when complaints receive responses
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium">Anonymous Mode Default</p>
                    <p className="text-xs text-muted-foreground">
                      Default to anonymous when creating issues
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="animate-fade-in border-brand-200 dark:border-brand-800" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-50 to-brand-100/50 p-6 dark:from-brand-900/20 dark:to-brand-800/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Free Plan</h3>
                  <Badge variant="secondary">Current</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Basic access to issue tracking and complaint generation
                </p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>5 issues per month</p>
                  <p>Basic AI analysis</p>
                  <p>Email complaint sending</p>
                </div>
              </div>
              <div className="text-right">
                <Button variant="brand" size="lg" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Starting at £9.99/month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
