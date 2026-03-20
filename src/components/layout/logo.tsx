import { cn } from "@/lib/utils"
import { Shield } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: "h-6 w-6", ring: "h-8 w-8", text: "text-lg" },
  md: { icon: "h-7 w-7", ring: "h-10 w-10", text: "text-xl" },
  lg: { icon: "h-10 w-10", ring: "h-14 w-14", text: "text-3xl" },
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm",
          s.ring
        )}
      >
        <Shield className={cn("text-white", s.icon)} strokeWidth={2.2} />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-foreground", s.text)}>
          Civic<span className="text-brand-500">Shield</span>
        </span>
      )}
    </div>
  )
}
