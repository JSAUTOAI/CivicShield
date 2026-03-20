import * as React from "react"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  src?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <img src={src} alt={name || ""} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 font-semibold text-white",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {name ? getInitials(name) : "?"}
    </div>
  )
}
