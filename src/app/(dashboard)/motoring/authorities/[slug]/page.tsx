"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMotoringAuthority, MOTORING_ISSUE_CATEGORIES } from "@/lib/motoring-data"
import { ArrowLeft, ExternalLink, Phone, Globe, FileText } from "lucide-react"

export default function AuthorityDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const authority = getMotoringAuthority(slug)

  if (!authority) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Authority Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The requested authority does not exist.</p>
        <Link href="/motoring" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to Motoring Hub
        </Link>
      </div>
    )
  }

  // Find which issue categories involve this authority
  const relatedCategories = MOTORING_ISSUE_CATEGORIES.filter((cat) => {
    const bodies = [cat.responsibleBodies.primary, cat.responsibleBodies.secondary, cat.responsibleBodies.escalation]
    return bodies.some(
      (b) =>
        b.name.toLowerCase().includes(authority.abbreviation.toLowerCase()) ||
        b.abbreviation?.toLowerCase() === authority.abbreviation.toLowerCase()
    )
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <Link href="/motoring" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Motoring Hub
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <Badge variant="brand" className="text-base px-3 py-1">{authority.abbreviation}</Badge>
          <div>
            <h1 className="text-xl font-bold">{authority.name}</h1>
            <Badge variant="secondary" className="mt-1 text-[10px]">{authority.jurisdiction}</Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">About</h2>
            <p className="mt-1 text-sm">{authority.description}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">When to Contact</h2>
            <p className="mt-1 text-sm">{authority.whenToContact}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Limitations</h2>
            <p className="mt-1 text-sm">{authority.whatTheyCannotDo}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact & Complaints</h2>
          <div className="space-y-3">
            <a
              href={authority.complaintsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50/50 p-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100/50 dark:border-brand-900/30 dark:bg-brand-900/10 dark:text-brand-300"
            >
              <FileText className="h-4 w-4" />
              Submit a Complaint
              <ExternalLink className="ml-auto h-3.5 w-3.5" />
            </a>

            <a
              href={authority.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              Official Website
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </a>

            {authority.phoneNumber && (
              <a
                href={`tel:${authority.phoneNumber.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {authority.phoneNumber}
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Issue Categories */}
      {relatedCategories.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Related Issue Categories</h2>
          <div className="space-y-2">
            {relatedCategories.map((cat) => (
              <Link key={cat.slug} href={`/motoring/issues/${cat.slug}`}>
                <Card className="card-hover">
                  <CardContent className="flex items-center gap-3 p-3">
                    <p className="flex-1 text-sm font-medium">{cat.title}</p>
                    <Badge variant="secondary" className="text-[10px]">View</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
