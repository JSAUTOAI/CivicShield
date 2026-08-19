"use client"

import * as React from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { PageSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState, ErrorState } from "@/components/ui/empty-state"
import { useFetch } from "@/lib/hooks"
import {
  TrendingUp,
  Users,
  Search,
  Plus,
  Flame,
  CheckCircle,
} from "lucide-react"

interface Petition {
  id: number
  title: string
  description: string
  category: string | null
  targetOrg: string | null
  targetCount: number
  signatureCount: number
  status: string
  isTrending: boolean
  keywords: string[]
  createdAt: string
  hasSigned: boolean
}

export default function PetitionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [signingId, setSigningId] = React.useState<number | null>(null)

  const { data, loading, error, refetch } = useFetch<{ data: Petition[] }>("/api/petitions")
  const petitions = React.useMemo(() => data?.data ?? [], [data])

  const filtered = petitions.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      (p.category?.toLowerCase().includes(q) ?? false) ||
      (p.targetOrg?.toLowerCase().includes(q) ?? false) ||
      p.keywords.some((k) => k.toLowerCase().includes(q))
    )
  })

  const totalSignatures = petitions.reduce((sum, p) => sum + p.signatureCount, 0)
  const trendingCount = petitions.filter((p) => p.isTrending).length

  async function handleSign(petitionId: number) {
    setSigningId(petitionId)
    try {
      const res = await fetch(`/api/petitions/${petitionId}/sign`, { method: "POST" })
      const body = await res.json().catch(() => ({ error: "Failed to sign" }))
      if (!res.ok) throw new Error(body.error || "Failed to sign petition")
      toast.success("Petition signed")
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSigningId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Trending Petitions</h1>
            <Badge variant="warning">Popular</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Join campaigns to hold organisations accountable and drive change
          </p>
        </div>
        {/* Creating petitions isn't built yet — disabled rather than silently inert */}
        <Button variant="brand" className="gap-2" disabled title="Coming soon">
          <Plus className="h-4 w-4" />
          Start a Petition
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search petitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats bar */}
      <div className="mb-8 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <TrendingUp className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{petitions.length}</p>
              <p className="text-xs text-muted-foreground">Active Petitions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSignatures.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Signatures</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <Flame className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trendingCount}</p>
              <p className="text-xs text-muted-foreground">Trending Now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Petitions list */}
      {loading ? (
        <PageSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title={searchQuery ? "No petitions match your search" : "No petitions yet"}
          description={
            searchQuery
              ? "Try a different keyword, organisation, or category."
              : "There are no active petitions right now. Check back soon."
          }
        />
      ) : (
        <div className="space-y-4 stagger-fade-in">
          {filtered.map((petition) => {
            const progress = petition.targetCount
              ? Math.min((petition.signatureCount / petition.targetCount) * 100, 100)
              : 0

            return (
              <Card key={petition.id} className="card-hover overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {petition.title}
                        </h3>
                        {petition.isTrending && (
                          <Badge variant="warning" className="gap-1">
                            <Flame className="h-3 w-3" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      {(petition.category || petition.targetOrg) && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {petition.category && (
                            <span className="font-medium text-brand-600 dark:text-brand-400">
                              {petition.category}
                            </span>
                          )}
                          {petition.category && petition.targetOrg && " — "}
                          {petition.targetOrg && `Target: ${petition.targetOrg}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    {petition.description}
                  </p>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {petition.signatureCount.toLocaleString()}{" "}
                        <span className="font-normal text-muted-foreground">
                          of {petition.targetCount.toLocaleString()} signatures
                        </span>
                      </span>
                      <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {petition.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant={petition.hasSigned ? "outline" : "brand"}
                      size="sm"
                      className="gap-1.5"
                      disabled={petition.hasSigned || signingId === petition.id}
                      loading={signingId === petition.id}
                      onClick={() => handleSign(petition.id)}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {petition.hasSigned ? "Signed" : "Sign Petition"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
