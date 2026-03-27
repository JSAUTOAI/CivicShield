"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useFetch } from "@/lib/hooks"
import type { DictionaryTermData, DictionaryListResponse } from "@/lib/types"
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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

export default function DictionaryPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeLetter, setActiveLetter] = React.useState<string | null>(null)
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build API URL
  const params = new URLSearchParams()
  if (debouncedSearch) params.set("search", debouncedSearch)
  if (activeLetter) params.set("letter", activeLetter)
  if (activeCategory) params.set("category", activeCategory)
  params.set("page", String(page))
  params.set("limit", "30")

  const { data } = useFetch<{ success: true; data: DictionaryListResponse }>(
    `/api/dictionary?${params.toString()}`
  )

  const { data: categoriesData } = useFetch<{
    success: true
    data: Array<{ value: string; label: string; count: number }>
  }>("/api/dictionary/categories")

  const terms = data?.data?.terms ?? []
  const total = data?.data?.total ?? 0
  const totalPages = data?.data?.totalPages ?? 1
  const letterCounts = data?.data?.letterCounts ?? {}
  const categories = categoriesData?.data ?? []

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
          Legal Dictionary
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plain-language definitions of UK legal terms, linked to relevant legislation and case law
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search legal terms, definitions, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11"
        />
      </div>

      {/* Alphabet Bar */}
      <div
        className="mb-4 flex items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <button
          onClick={() => { setActiveLetter(null); setPage(1) }}
          className={cn(
            "flex-shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
            activeLetter === null
              ? "bg-brand-600 text-white dark:bg-brand-500"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          All
        </button>
        {letters.map((letter) => {
          const count = letterCounts[letter] ?? 0
          return (
            <button
              key={letter}
              onClick={() => {
                if (count > 0) {
                  setActiveLetter(activeLetter === letter ? null : letter)
                  setPage(1)
                }
              }}
              disabled={count === 0}
              className={cn(
                "flex-shrink-0 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200",
                activeLetter === letter
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : count === 0
                    ? "opacity-30 cursor-not-allowed text-muted-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div
          className="mb-6 flex flex-wrap gap-2 animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          <button
            onClick={() => { setActiveCategory(null); setPage(1) }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
              activeCategory === null
                ? "bg-brand-600 text-white dark:bg-brand-500"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setActiveCategory(activeCategory === cat.value ? null : cat.value)
                setPage(1)
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                activeCategory === cat.value
                  ? "bg-brand-600 text-white dark:bg-brand-500"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-xs text-muted-foreground">
        {total} {total === 1 ? "term" : "terms"} found
      </div>

      {/* Terms Grid */}
      {terms.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {terms.map((term) => (
            <TermCard key={term.id} term={term} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-foreground">No terms found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              page === 1
                ? "opacity-50 cursor-not-allowed text-muted-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              page === totalPages
                ? "opacity-50 cursor-not-allowed text-muted-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function TermCard({ term }: { term: DictionaryTermData }) {
  return (
    <Link href={`/dictionary/${term.slug}`}>
      <Card className="card-hover h-full">
        <CardContent className="p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground leading-tight">
              {term.term}
            </h3>
            {term.isFeatured && (
              <Star className="h-3.5 w-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="mb-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {term.definition}
          </p>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 text-[10px]">
              {CATEGORY_LABELS[term.category] ?? term.category}
            </Badge>
          </div>
          {term.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {term.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {term.tags.length > 3 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  +{term.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
