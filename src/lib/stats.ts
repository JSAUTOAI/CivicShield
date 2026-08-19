import { db } from "@/lib/db"

export interface PublicStats {
  issues: number
  complaintsSent: number
  organisations: number
  dictionaryTerms: number
}

/**
 * Aggregate, non-identifying platform counts for the public landing page.
 *
 * These replaced hardcoded marketing figures ("10,000+ Issues Tracked",
 * "95% Complaint Response Rate") that were not true. Every number here is
 * a live count — if a figure can't be measured honestly, don't display it.
 */
export async function getPublicStats(): Promise<PublicStats> {
  const [issues, complaintsSent, organisations, dictionaryTerms] = await Promise.all([
    db.issue.count(),
    db.complaint.count({ where: { status: { in: ["sent", "opened", "responded"] } } }),
    db.submissionTarget.count(),
    db.dictionaryTerm.count(),
  ])

  return { issues, complaintsSent, organisations, dictionaryTerms }
}

/**
 * Same counts, but never throws.
 *
 * The landing page is prerendered at build time and revalidated every 5
 * minutes, so an unreachable database would otherwise fail the whole Vercel
 * deploy — or blank the front door — over four decorative numbers. Falling
 * back to zeroes lets the page render; `buildStats` hides any zero tile
 * rather than advertising "0 Issues Logged".
 */
export async function getPublicStatsSafe(): Promise<PublicStats> {
  try {
    return await getPublicStats()
  } catch (error) {
    console.error("Public stats unavailable, falling back to zeroes:", error)
    return { issues: 0, complaintsSent: 0, organisations: 0, dictionaryTerms: 0 }
  }
}
