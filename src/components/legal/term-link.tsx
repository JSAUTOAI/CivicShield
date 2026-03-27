"use client"

import Link from "next/link"

interface TermLinkProps {
  slug: string
  term: string
}

export function TermLink({ slug, term }: TermLinkProps) {
  return (
    <Link
      href={`/dictionary/${slug}`}
      className="underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-brand-600 hover:decoration-brand-600 dark:hover:text-brand-400 dark:hover:decoration-brand-400"
    >
      {term}
    </Link>
  )
}
