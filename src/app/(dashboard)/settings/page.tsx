"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useFetch } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/loading-skeleton"
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
  Loader2,
} from "lucide-react"

interface UserProfile {
  id: number
  username: string
  email: string
  fullName: string | null
  phone: string | null
  address: string | null
  theme: string
  subscriptionStatus: string
  subscriptionTier: string
  subscriptionExpiresAt: string | null
  emailNotifications: boolean
  anonymousDefault: boolean
  createdAt: string
}

interface UsageStats {
  tier: string
  status: string
  expiresAt: string | null
  complaintsUsed: number
  complaintsLimit: number
  followUpsPerComplaint: number
  maxFilesPerIssue: number
  maxFileSizeMB: number
  features: string[]
  isLifetimeLimit: boolean
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const { data: profileResponse } = useFetch<{ success: boolean; data: UserProfile }>("/api/settings/profile")
  const profile = profileResponse?.data || (profileResponse as unknown as UserProfile)
  const { data: usageResponse } = useFetch<{ success: boolean; data: UsageStats }>("/api/subscription/usage")
  const usage = usageResponse?.data

  const [showPassword, setShowPassword] = React.useState(false)
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingPassword, setSavingPassword] = React.useState(false)
  const [loadingCheckout, setLoadingCheckout] = React.useState(false)
  const [loadingPortal, setLoadingPortal] = React.useState(false)

  // Preference toggles
  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [anonymousDefault, setAnonymousDefault] = React.useState(false)

  // Profile form state
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [address, setAddress] = React.useState("")

  // Password form state
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  // Sync form state when profile loads
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "")
      setPhone(profile.phone || "")
      setAddress(profile.address || "")
      setEmailNotifications(profile.emailNotifications ?? true)
      setAnonymousDefault(profile.anonymousDefault ?? false)
    }
  }, [profile])

  async function handleTogglePreference(field: "emailNotifications" | "anonymousDefault", value: boolean) {
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error()
      if (field === "emailNotifications") setEmailNotifications(value)
      if (field === "anonymousDefault") setAnonymousDefault(value)
      toast.success("Preference updated")
    } catch {
      toast.error("Failed to update preference")
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, address }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast.success("Profile updated")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update password")
      toast.success("Password updated")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleUpgrade(tier: string) {
    setLoadingCheckout(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start checkout")
      window.location.href = data.data.url
    } catch (err) {
      toast.error((err as Error).message)
      setLoadingCheckout(false)
    }
  }

  async function handleManageSubscription() {
    setLoadingPortal(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to open billing portal")
      window.location.href = data.data.url
    } catch (err) {
      toast.error((err as Error).message)
      setLoadingPortal(false)
    }
  }

  const tierLabels: Record<string, string> = { free: "Free", basic: "Basic", pro: "Pro", agency: "Agency" }
  const currentTier = usage?.tier || profile?.subscriptionTier || "free"
  const tierLabel = tierLabels[currentTier] || "Free"
  const isFreeTier = currentTier === "free"
  const isPaidTier = ["basic", "pro", "agency"].includes(currentTier)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
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
                <Badge variant={isFreeTier ? "default" : "brand"} className="mt-1">
                  {tierLabel} Plan
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  icon={<Phone className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your address"
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="brand" className="gap-2" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingProfile ? "Saving..." : "Save Changes"}
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
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
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
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleChangePassword}
                disabled={savingPassword || !currentPassword || !newPassword}
              >
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {savingPassword ? "Updating..." : "Update Password"}
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
              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
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

              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when complaints receive responses
                    </p>
                  </div>
                </div>
                <Button
                  variant={emailNotifications ? "brand" : "outline"}
                  size="sm"
                  onClick={() => handleTogglePreference("emailNotifications", !emailNotifications)}
                >
                  {emailNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium">Anonymous Mode Default</p>
                    <p className="text-xs text-muted-foreground">
                      Default to anonymous when creating issues
                    </p>
                  </div>
                </div>
                <Button
                  variant={anonymousDefault ? "brand" : "outline"}
                  size="sm"
                  onClick={() => handleTogglePreference("anonymousDefault", !anonymousDefault)}
                >
                  {anonymousDefault ? "Enabled" : "Disabled"}
                </Button>
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
            <CardDescription>Manage your plan and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="rounded-xl bg-gradient-to-r from-brand-50 to-brand-100/50 p-6 dark:from-brand-900/20 dark:to-brand-800/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{tierLabel} Plan</h3>
                    <Badge variant={isPaidTier ? "brand" : "secondary"}>Current</Badge>
                    {usage?.status === "past_due" && (
                      <Badge variant="warning">Payment Due</Badge>
                    )}
                    {usage?.status === "cancelled" && (
                      <Badge variant="destructive">Cancelled</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isFreeTier && "3 free complaint sends to experience the full platform"}
                    {currentTier === "basic" && "5 complaints/month with auto-send and basic tracking"}
                    {currentTier === "pro" && "15 complaints/month with case builder and full tracking"}
                    {currentTier === "agency" && "30 complaints/month with bulk send and priority support"}
                  </p>
                </div>
                <div className="text-right">
                  {isPaidTier ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                    >
                      {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      Manage Billing
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            {usage && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Usage</h4>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Complaints {usage.isLifetimeLimit ? "(lifetime)" : "(this month)"}
                    </span>
                    <span className="text-sm font-medium">
                      {usage.complaintsUsed} / {usage.complaintsLimit}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usage.complaintsUsed >= usage.complaintsLimit
                          ? "bg-red-500"
                          : usage.complaintsUsed >= usage.complaintsLimit * 0.8
                            ? "bg-amber-500"
                            : "bg-brand-500"
                      }`}
                      style={{ width: `${Math.min((usage.complaintsUsed / usage.complaintsLimit) * 100, 100)}%` }}
                    />
                  </div>
                  {usage.complaintsUsed >= usage.complaintsLimit && (
                    <p className="mt-2 text-xs text-red-500">
                      {usage.isLifetimeLimit
                        ? "You've used all free sends. Upgrade to continue."
                        : "Monthly limit reached. Resets next month or upgrade for more."}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{usage.followUpsPerComplaint}</p>
                    <p className="text-xs text-muted-foreground">Follow-ups / complaint</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{usage.maxFilesPerIssue}</p>
                    <p className="text-xs text-muted-foreground">Files / issue</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">
                      {usage.maxFileSizeMB >= 1024 ? `${(usage.maxFileSizeMB / 1024).toFixed(0)}GB` : `${usage.maxFileSizeMB}MB`}
                    </p>
                    <p className="text-xs text-muted-foreground">Max file size</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Options */}
            {(isFreeTier || currentTier === "basic") && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Upgrade Your Plan</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Basic */}
                  {isFreeTier && (
                    <div className="rounded-lg border border-border p-4">
                      <h5 className="font-semibold">Basic</h5>
                      <p className="text-2xl font-bold mt-1">£4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        <li>5 complaints/month</li>
                        <li>10 follow-ups each</li>
                        <li>Auto-send emails</li>
                        <li>Basic tracking</li>
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={() => handleUpgrade("basic")}
                        disabled={loadingCheckout}
                      >
                        {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Basic"}
                      </Button>
                    </div>
                  )}

                  {/* Pro */}
                  <div className="rounded-lg border-2 border-brand-500 p-4 relative">
                    <Badge variant="brand" className="absolute -top-2.5 right-3 text-[10px]">Popular</Badge>
                    <h5 className="font-semibold">Pro</h5>
                    <p className="text-2xl font-bold mt-1">£14.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <li>15 complaints/month</li>
                      <li>20 follow-ups each</li>
                      <li>Full case builder</li>
                      <li>PDF export</li>
                      <li>Priority support</li>
                    </ul>
                    <Button
                      variant="brand"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleUpgrade("pro")}
                      disabled={loadingCheckout}
                    >
                      {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Pro"}
                    </Button>
                  </div>

                  {/* Agency */}
                  <div className="rounded-lg border border-border p-4">
                    <h5 className="font-semibold">Agency</h5>
                    <p className="text-2xl font-bold mt-1">£19.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <li>30 complaints/month</li>
                      <li>50 follow-ups each</li>
                      <li>Everything in Pro</li>
                      <li>Bulk send</li>
                      <li>2GB file uploads</li>
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleUpgrade("agency")}
                      disabled={loadingCheckout}
                    >
                      {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Agency"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
