"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { useTheme } from "./theme-provider"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  ListChecks,
  BookOpen,
  Plus,
  FileText,
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  TrendingUp,
  Star,
  HelpCircle,
  LogOut,
  Settings,
  User,
} from "lucide-react"

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Issues", href: "/issues", icon: ListChecks },
  { label: "Resources", href: "/resources", icon: BookOpen, badge: "New" },
  { label: "New", href: "/issues/new", icon: Plus },
  { label: "Complaints", href: "/complaints", icon: FileText },
]

const moreItems = [
  { label: "Trending Petitions", href: "/petitions", icon: TrendingUp, badge: "Popular" },
  { label: "Rights Explorer", href: "/rights", icon: Search },
  { label: "Case Law Library", href: "/case-law", icon: Star },
  { label: "Help & Support", href: "/help", icon: HelpCircle },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const userName = session?.user?.name || "User"
  const userEmail = session?.user?.email || ""
  const [moreOpen, setMoreOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const moreRef = React.useRef<HTMLDivElement>(null)
  const profileRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0">
          <Logo size="md" />
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="brand" className="ml-0.5 px-1.5 py-0 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-500" />
                )}
              </Link>
            )
          })}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <HelpCircle className="h-4 w-4" />
              <span>More</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  moreOpen && "rotate-180"
                )}
              />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 animate-scale-in rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  Additional Resources
                </p>
                {moreItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="warning" className="ml-auto text-[10px]">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {theme === "light" ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {/* Profile */}
          <div ref={profileRef} className="relative ml-1">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-accent"
            >
              <Avatar name={userName} size="sm" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 animate-scale-in rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                <div className="border-b border-border px-3 py-2.5 mb-1.5">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
                <div className="my-1.5 border-t border-border" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="border-t border-border bg-background px-4 py-3 animate-slide-in-top">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search issues, complaints, resources, legislation..."
                className="h-11 w-full rounded-lg border border-input bg-muted pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
