import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateRoutes, computeRouteStatus } from "@/lib/routing"
import { getEffectiveTier } from "@/lib/subscription"
import { notify } from "@/lib/notifications"

/** Web search across several bodies — longer than a plain request. */
export const maxDuration = 60

/**
 * GET  /api/issues/[id]/routes — list routes with their availability recomputed
 * POST /api/issues/[id]/routes — work out the routes for this issue
 *
 * Availability is recomputed on read rather than stored, because it depends on
 * elapsed time since the primary complaint was sent. A notification fires the
 * first time a route opens, so the user finds out without checking the page.
 */

async function loadWithStatus(issueId: number, userId: number) {
  const [routes, primaryComplaint] = await Promise.all([
    db.complaintRoute.findMany({
      where: { issueId },
      orderBy: [{ routeType: "asc" }, { sortOrder: "asc" }],
    }),
    db.complaint.findFirst({
      where: { issueId, status: { in: ["sent", "opened", "responded"] } },
      orderBy: { sentAt: "asc" },
      select: { sentAt: true, respondedAt: true },
    }),
  ])

  const now = new Date()
  const decorated = []

  for (const r of routes) {
    const { status, availableAt, reason } = computeRouteStatus(r, primaryComplaint, now)

    // Persist a change so the notification fires once, not on every load.
    if (status !== r.status || (availableAt && +availableAt !== +(r.availableAt ?? 0))) {
      await db.complaintRoute.update({
        where: { id: r.id },
        data: { status, availableAt },
      })
    }

    if (status === "available" && r.routeType === "escalation" && !r.notifiedAt) {
      await db.complaintRoute.update({
        where: { id: r.id },
        data: { notifiedAt: now },
      })
      await notify({
        userId,
        type: "system",
        title: `You can now escalate to ${r.organizationName}`,
        body: r.purpose,
        link: `/issues/${issueId}`,
      })
    }

    decorated.push({ ...r, status, availableAt, lockReason: reason })
  }

  return decorated
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { id } = await params
    const issueId = parseInt(id)

    const issue = await db.issue.findFirst({
      where: { id: issueId, userId },
      select: { id: true },
    })
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 })

    return NextResponse.json({ routes: await loadWithStatus(issueId, userId) })
  } catch (error) {
    console.error("Error loading routes:", error)
    return NextResponse.json({ error: "Failed to load routes" }, { status: 500 })
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { id } = await params
    const issueId = parseInt(id)

    const issue = await db.issue.findFirst({
      where: { id: issueId, userId },
      include: { complaints: { take: 1, orderBy: { createdAt: "desc" } } },
    })
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 })

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true, subscriptionStatus: true },
    })

    const generated = await generateRoutes({
      issueCategory: issue.issueCategory,
      issueType: issue.issueType,
      description: issue.description,
      organization: issue.organization,
      individual: issue.individual,
      location: issue.location,
      dateOfIncident: issue.dateOfIncident,
      knownRecipientEmail: issue.complaints[0]?.recipientEmail ?? null,
      subscriptionTier: user
        ? getEffectiveTier(user.subscriptionTier ?? "free", user.subscriptionStatus)
        : "free",
    })

    if (generated.length === 0) {
      return NextResponse.json(
        { error: "Couldn't work out the routes for this issue. Please try again." },
        { status: 502 }
      )
    }

    // Replace rather than append, so regenerating doesn't duplicate. Routes
    // already acted on are kept — the user has sent those.
    await db.complaintRoute.deleteMany({ where: { issueId, sentAt: null } })

    const typeOrder = { primary: 0, parallel: 1, escalation: 2 } as const
    await db.complaintRoute.createMany({
      data: generated.map((r, i) => ({
        issueId,
        routeType: r.routeType,
        sortOrder: typeOrder[r.routeType] * 100 + i,
        organizationName: r.organizationName,
        purpose: r.purpose,
        method: r.method,
        contactEmail: r.contactEmail,
        contactAddress: r.contactAddress,
        formUrl: r.formUrl,
        sourceUrl: r.sourceUrl,
        condition: r.condition,
        unlockAfterDays: r.unlockAfterDays,
        requiresNoResolution: r.requiresNoResolution,
        deadlineNote: r.deadlineNote,
        status: r.routeType === "escalation" ? "locked" : "available",
      })),
    })

    return NextResponse.json({ routes: await loadWithStatus(issueId, userId) })
  } catch (error) {
    console.error("Route generation error:", error)

    if (error instanceof Anthropic.BadRequestError) {
      const detail = String(error.message || "").toLowerCase()
      if (detail.includes("credit balance")) {
        console.error("ANTHROPIC CREDIT EXHAUSTED — route mapping is unavailable.")
        return NextResponse.json(
          { error: "Route mapping is temporarily unavailable. Please try again shortly." },
          { status: 503 }
        )
      }
    }

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Couldn't work out the routes (${error.status}). Please try again.` },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: "Failed to work out the routes" }, { status: 500 })
  }
}
