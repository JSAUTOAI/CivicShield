"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  Users,
  Search,
  Plus,
  ArrowRight,
  Flame,
  Clock,
  CheckCircle,
} from "lucide-react"

const petitions = [
  {
    id: 1,
    title: "Increase Transparency in Local Council Spending",
    description: "Demand that all local councils in Wales publish detailed breakdowns of their spending, including contractor payments and consultancy fees.",
    category: "Government Accountability",
    targetOrg: "Welsh Government",
    targetCount: 5000,
    currentCount: 3247,
    isTrending: true,
    createdAt: "2025-12-15",
    keywords: ["transparency", "council", "spending"],
  },
  {
    id: 2,
    title: "Reform Bailiff Regulations to Protect Homeowners",
    description: "Strengthen regulations around bailiff conduct, including mandatory body cameras and stricter enforcement of entry rules under the Taking Control of Goods Regulations 2013.",
    category: "Legal Reform",
    targetOrg: "Ministry of Justice",
    targetCount: 10000,
    currentCount: 7891,
    isTrending: true,
    createdAt: "2025-11-20",
    keywords: ["bailiffs", "reform", "homeowners"],
  },
  {
    id: 3,
    title: "Protect Citizens' Right to Film in Public Spaces",
    description: "Enshrine in law the explicit right of citizens to film and photograph in all public spaces without interference from police or security personnel.",
    category: "Civil Liberties",
    targetOrg: "Home Office",
    targetCount: 2000,
    currentCount: 1456,
    isTrending: false,
    createdAt: "2026-01-10",
    keywords: ["photography", "filming", "public spaces"],
  },
  {
    id: 4,
    title: "Independent Review of Police Complaint Handling",
    description: "Call for a fully independent review of how police forces handle complaints, with binding recommendations for improvement.",
    category: "Police Accountability",
    targetOrg: "IOPC",
    targetCount: 3000,
    currentCount: 2103,
    isTrending: true,
    createdAt: "2026-02-05",
    keywords: ["police", "complaints", "accountability"],
  },
  {
    id: 5,
    title: "Fair Parking Enforcement Standards",
    description: "Introduce national standards for private parking enforcement companies, including caps on fines and mandatory appeals processes.",
    category: "Consumer Rights",
    targetOrg: "Department for Transport",
    targetCount: 5000,
    currentCount: 1200,
    isTrending: false,
    createdAt: "2026-03-01",
    keywords: ["parking", "fines", "enforcement"],
  },
]

export default function PetitionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filtered = petitions.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.keywords.some((k) => k.includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
        <Button variant="brand" className="gap-2">
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
              <p className="text-2xl font-bold">
                {petitions.reduce((sum, p) => sum + p.currentCount, 0).toLocaleString()}
              </p>
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
              <p className="text-2xl font-bold">{petitions.filter((p) => p.isTrending).length}</p>
              <p className="text-xs text-muted-foreground">Trending Now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Petitions list */}
      <div className="space-y-4 stagger-fade-in">
        {filtered.map((petition) => {
          const progress = (petition.currentCount / petition.targetCount) * 100

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
                    <p className="text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-brand-600 dark:text-brand-400">
                        {petition.category}
                      </span>
                      {" "}— Target: {petition.targetOrg}
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  {petition.description}
                </p>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-foreground">
                      {petition.currentCount.toLocaleString()}{" "}
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
                  <Button variant="brand" size="sm" className="gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Sign Petition
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
