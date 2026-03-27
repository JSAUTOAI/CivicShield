"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DictionaryTermData } from "@/lib/types"

interface TermCardProps {
  term: DictionaryTermData
}

export function TermCard({ term }: TermCardProps) {
  return (
    <Link href={`/dictionary/${term.slug}`}>
      <Card className="card-hover">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-foreground">{term.term}</h3>
              <Badge
                className={cn(
                  "shrink-0 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                )}
              >
                {term.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {term.definition}
            </p>
            {term.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {term.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
