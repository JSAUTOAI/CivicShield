"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  ListChecks,
  Plus,
  FileText,
  Briefcase,
} from "lucide-react"

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Issues", href: "/issues", icon: ListChecks },
  { label: "New", href: "/issues/new", icon: Plus, highlight: true },
  { label: "Complaints", href: "/complaints", icon: FileText },
  { label: "Cases", href: "/cases", icon: Briefcase },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 p-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-md">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg p-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
