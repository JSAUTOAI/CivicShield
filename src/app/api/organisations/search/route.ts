import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { searchOrganisation, type OrganisationCandidate } from "@/lib/organisation-search"

/** Web search plus a model call — longer than a plain request, well under the cap. */
export const maxDuration = 60

/**
 * POST /api/organisations/search
 *
 * Returns a LIST of candidate organisations for the user to choose from,
 * each with the source URL its details came from. It no longer returns a
 * single answer, because a single answer invites trusting it — and the
 * previous version silently invented addresses when it could not find one.
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const organizationName = (body.organizationName || "").trim()
    const issueCategory = body.issueCategory?.trim() || null
    const location = body.location?.trim() || null

    if (!organizationName || organizationName.length < 2) {
      return NextResponse.json(
        { success: false, data: null, error: "Organisation name must be at least 2 characters" },
        { status: 400 }
      )
    }

    const candidates: OrganisationCandidate[] = []

    // Previously-verified entries come first — they were confirmed once and
    // save both a web search and the wait.
    const cached = await db.submissionTarget.findMany({
      where: {
        organizationName: { contains: organizationName, mode: "insensitive" },
        isActive: true,
      },
      take: 3,
    })

    for (const c of cached) {
      candidates.push({
        organizationName: c.organizationName,
        organizationType: c.organizationType,
        department: c.department,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        contactAddress: c.contactAddress,
        websiteUrl: c.websiteUrl,
        complaintUrl: c.complaintUrl,
        region: c.region,
        jurisdiction: c.jurisdiction,
        responseTimeDays: c.responseTimeDays,
        escalationPath: Array.isArray(c.escalationPath) ? c.escalationPath.map(String) : [],
        sourceUrl: c.websiteUrl,
        confidence: "high",
        note: "Saved from a previous lookup",
      })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        data: { candidates, searched: false },
        error: null,
      })
    }

    try {
      const found = await searchOrganisation({ organizationName, issueCategory, location })

      // Don't show the same organisation twice.
      const seen = new Set(
        candidates.map((c) => `${c.organizationName.toLowerCase()}|${c.contactEmail ?? ""}`)
      )
      for (const f of found) {
        const key = `${f.organizationName.toLowerCase()}|${f.contactEmail ?? ""}`
        if (!seen.has(key)) {
          candidates.push(f)
          seen.add(key)
        }
      }

      // Cache only what was actually verified — caching a null-heavy guess
      // would poison future lookups for everyone.
      for (const f of found) {
        if (!f.contactEmail && !f.contactAddress) continue
        const exists = await db.submissionTarget.findFirst({
          where: { organizationName: f.organizationName, contactEmail: f.contactEmail },
        })
        if (exists) continue
        await db.submissionTarget
          .create({
            data: {
              organizationName: f.organizationName,
              organizationType: f.organizationType,
              department: f.department,
              contactEmail: f.contactEmail,
              contactPhone: f.contactPhone,
              contactAddress: f.contactAddress,
              websiteUrl: f.websiteUrl,
              complaintUrl: f.complaintUrl,
              region: f.region,
              jurisdiction: f.jurisdiction,
              responseTimeDays: f.responseTimeDays,
              escalationPath: f.escalationPath,
              isActive: true,
            },
          })
          .catch((e) => console.error("Failed to cache organisation:", e))
      }
    } catch (searchErr) {
      console.error("Organisation web search failed:", searchErr)
      if (candidates.length === 0) {
        const isCredit =
          searchErr instanceof Anthropic.BadRequestError &&
          String(searchErr.message).toLowerCase().includes("credit balance")
        return NextResponse.json(
          {
            success: false,
            data: { candidates: [], searched: false },
            error: isCredit
              ? "Search is temporarily unavailable. Please enter the details manually."
              : "Couldn't search for this organisation. Please enter the details manually.",
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: { candidates, searched: true },
      error: null,
    })
  } catch (error) {
    console.error("Organisation search error:", error)
    return NextResponse.json(
      { success: false, data: null, error: "Failed to search for organisation" },
      { status: 500 }
    )
  }
}
