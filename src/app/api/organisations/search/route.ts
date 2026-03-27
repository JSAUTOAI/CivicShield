import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
// Uses raw fetch to Anthropic API (no SDK dependency)

/**
 * POST /api/organisations/search
 *
 * Search for organisation complaint contact details.
 * 1. Check SubmissionTarget cache first
 * 2. If not found, use Claude AI to search for details
 * 3. Cache result in SubmissionTarget for future lookups
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

    if (!organizationName || organizationName.length < 2) {
      return NextResponse.json(
        { success: false, data: null, error: "Organisation name must be at least 2 characters" },
        { status: 400 }
      )
    }

    // 1. Check cache (SubmissionTarget table)
    const cached = await db.submissionTarget.findFirst({
      where: {
        organizationName: { contains: organizationName, mode: "insensitive" },
        isActive: true,
      },
    })

    if (cached) {
      return NextResponse.json({
        success: true,
        data: {
          organizationName: cached.organizationName,
          organizationType: cached.organizationType,
          department: cached.department,
          contactEmail: cached.contactEmail,
          contactPhone: cached.contactPhone,
          contactAddress: cached.contactAddress,
          websiteUrl: cached.websiteUrl,
          complaintUrl: cached.complaintUrl,
          region: cached.region,
          jurisdiction: cached.jurisdiction,
          responseTimeDays: cached.responseTimeDays,
          escalationPath: cached.escalationPath,
        },
        cached: true,
      })
    }

    // 2. Search via Claude AI
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, data: null, error: "AI search not available — please enter details manually" },
        { status: 503 }
      )
    }

    const issueCategoryContext = issueCategory
      ? `\nThe complaint relates to the category: "${issueCategory}". Use this to identify the most relevant complaints department or division within the organisation.`
      : ""

    const prompt = `Find the COMPLAINTS department contact information for the following UK organisation: "${organizationName}".${issueCategoryContext}

I need the real, verified complaints department details — NOT general contact or customer service details. Specifically find:
- The complaints department email address
- The complaints department postal address
- The complaints department phone number
- The main website URL
- The dedicated complaints/feedback submission page URL

Return ONLY valid JSON with no other text:
{
  "organizationName": "Official full name of the organisation",
  "organizationType": "public_sector" or "business" or "legal" or "regulatory" or "other",
  "department": "Name of complaints department if known, or null",
  "contactEmail": "Complaints email address, or null if not found",
  "contactPhone": "Complaints phone number, or null if not found",
  "contactAddress": "Full postal address for complaints department, or null if not found",
  "websiteUrl": "Main website URL, or null",
  "complaintUrl": "Direct complaints page URL, or null",
  "region": "Region e.g. England and Wales, Scotland, UK-wide, or null",
  "jurisdiction": "Jurisdiction e.g. England, Wales, Scotland, UK, or null",
  "responseTimeDays": estimated response time in working days (number), or null,
  "escalationPath": ["Array of escalation bodies in order, e.g. Internal Review, then Ombudsman, etc."]
}

Important: Only include information you are confident is accurate and current. Use null for any field you cannot verify. Do not guess or fabricate contact details.`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => "")
      console.error("Anthropic API error:", response.status, errText)
      return NextResponse.json(
        { success: false, data: null, error: "AI search temporarily unavailable. Please enter details manually." },
        { status: 503 }
      )
    }

    const message = await response.json()
    const textBlock = message.content?.find((block: { type: string }) => block.type === "text")
    const content = textBlock?.text || ""

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, data: null, error: "Could not find details for this organisation. Please enter manually." },
        { status: 404 }
      )
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json(
        { success: false, data: null, error: "Could not parse organisation details. Please enter manually." },
        { status: 500 }
      )
    }

    const result = {
      organizationName: String(parsed.organizationName || organizationName),
      organizationType: String(parsed.organizationType || "other"),
      department: parsed.department ? String(parsed.department) : null,
      contactEmail: parsed.contactEmail ? String(parsed.contactEmail) : null,
      contactPhone: parsed.contactPhone ? String(parsed.contactPhone) : null,
      contactAddress: parsed.contactAddress ? String(parsed.contactAddress) : null,
      websiteUrl: parsed.websiteUrl ? String(parsed.websiteUrl) : null,
      complaintUrl: parsed.complaintUrl ? String(parsed.complaintUrl) : null,
      region: parsed.region ? String(parsed.region) : null,
      jurisdiction: parsed.jurisdiction ? String(parsed.jurisdiction) : null,
      responseTimeDays: typeof parsed.responseTimeDays === "number" ? parsed.responseTimeDays : null,
      escalationPath: Array.isArray(parsed.escalationPath) ? parsed.escalationPath : [],
    }

    // 3. Cache in SubmissionTarget
    try {
      await db.submissionTarget.create({
        data: {
          organizationName: result.organizationName,
          organizationType: result.organizationType,
          department: result.department,
          contactEmail: result.contactEmail,
          contactPhone: result.contactPhone,
          contactAddress: result.contactAddress,
          websiteUrl: result.websiteUrl,
          complaintUrl: result.complaintUrl,
          region: result.region,
          jurisdiction: result.jurisdiction,
          responseTimeDays: result.responseTimeDays,
          escalationPath: result.escalationPath,
          isActive: true,
        },
      })
    } catch (cacheErr) {
      // Non-fatal — log and continue
      console.error("Failed to cache org details:", cacheErr)
    }

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
    })
  } catch (error) {
    console.error("Organisation search error:", error)
    return NextResponse.json(
      { success: false, data: null, error: "Failed to search for organisation" },
      { status: 500 }
    )
  }
}
