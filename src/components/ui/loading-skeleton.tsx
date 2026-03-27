"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border py-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32 flex-1" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
