"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFetch } from "@/lib/hooks"
import type { DictionaryTermDetail } from "@/lib/types"
import {
  ArrowLeft,
  ExternalLink,
  Scale,
  Gavel,
  BookOpen,
  Quote,
  Star,
} from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  "constitutional": "Constitutional",
  "civil-rights": "Civil Rights",
  "criminal-law": "Criminal Law",
  "employment": "Employment",
  "housing": "Housing",
  "consumer": "Consumer",
  "data-protection": "Data Protection",
  "procedure": "Procedure",
}

export default function DictionaryTermPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data, loading } = useFetch<{ success: true; data: DictionaryTermDetail }>(
    `/api/dictionary/${slug}`
  )

  const term = data?.data

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (!term) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/dictionary"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dictionary
        </Link>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Term not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The term you're looking for doesn't exist in our dictionary.
          </p>
        </div>
      </div>
    )
  }

  const hasLegislation = term.relatedLegislation && term.relatedLegislation.length > 0
  const hasCases = term.relatedCases && term.relatedCases.length > 0
  const hasRelatedTerms = term.relatedTerms && term.relatedTerms.length > 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/dictionary"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dictionary
      </Link>

      {/* Term Header */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {term.term}
          </h1>
          {term.isFeatured && (
            <Star className="mt-1.5 h-5 w-5 flex-shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
            {CATEGORY_LABELS[term.category] ?? term.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {term.jurisdiction}
          </Badge>
        </div>
      </div>

      {/* Plain-Language Definition */}
      <Card className="mb-6 border-brand-100 dark:border-brand-900/30 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-6">
          <h2 className="mb-3 text-sm font-semibold text-brand-600 dark:text-brand-400">
            Definition
          </h2>
          <p className="text-sm leading-relaxed text-foreground">
            {term.definition}
          </p>
        </CardContent>
      </Card>

      {/* Legal Definition (if available) */}
      {term.legalDefinition && (
        <Card className="mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <CardContent className="bg-muted/30 p-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Formal Legal Definition
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground italic">
              {term.legalDefinition}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Usage Example */}
      {term.usageExample && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
            <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              {term.usageExample}
            </p>
          </div>
        </div>
      )}

      {/* Related Legislation */}
      {hasLegislation && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Scale className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Related Legislation
          </h2>
          <div className="space-y-2">
            {term.relatedLegislation.map((leg) => (
              <div key={leg.actName} className="flex items-center gap-2">
                {leg.url ? (
                  <a
                    href={leg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    {leg.actName}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-sm text-foreground">{leg.actName}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Case Law */}
      {hasCases && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Gavel className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Related Case Law
          </h2>
          <div className="space-y-2">
            {term.relatedCases.map((c) => (
              <div key={c.caseName} className="flex items-center gap-2">
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    {c.caseName}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-sm text-foreground">{c.caseName}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* See Also */}
      {hasRelatedTerms && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.35s" }}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            See Also
          </h2>
          <div className="flex flex-wrap gap-2">
            {term.relatedTerms.map((rt) => (
              <Link
                key={rt.slug}
                href={`/dictionary/${rt.slug}`}
                className="group rounded-lg border border-border bg-background p-3 transition-all hover:border-brand-200 hover:shadow-sm dark:hover:border-brand-800"
              >
                <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700 dark:text-brand-400 dark:group-hover:text-brand-300">
                  {rt.term}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  {rt.definition}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {term.tags.length > 0 && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex flex-wrap gap-1.5">
            {term.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      {term.source && (
        <div className="border-t border-border pt-4 animate-fade-in" style={{ animationDelay: "0.45s" }}>
          <p className="text-xs text-muted-foreground">
            Source: {term.source}
          </p>
        </div>
      )}
    </div>
  )
}
