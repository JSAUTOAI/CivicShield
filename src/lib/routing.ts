import Anthropic from "@anthropic-ai/sdk"
import { getAnalysisConfig } from "@/lib/ai-analysis"

/**
 * Works out every legitimate way a complaint can be pursued.
 *
 * A complaint rarely has one destination. A dispute with a solicitor can go to
 * the firm's complaints partner, the individual's employer, the SRA, or the
 * Legal Ombudsman — each appropriate at a different point and for a different
 * purpose. A vehicle defect goes to the manufacturer for redress and to the
 * DVSA for safety, which are parallel rather than sequential.
 *
 * Two rules shape the output, and both matter:
 *
 * 1. Most regulators reject a complaint that has not exhausted the
 *    organisation's own process first — the 8-week rule for the Financial and
 *    Legal Ombudsmen, local resolution for the IOPC. Sending early wastes the
 *    route and can harm the case, so escalations carry an unlock condition
 *    instead of being offered immediately.
 *
 * 2. Some routes are the body's own process, not an email. ACAS Early
 *    Conciliation is a notification form and is mandatory before an employment
 *    tribunal claim; a DVSA defect report is a web form. Emailing a letter to
 *    those achieves nothing, so they are marked method "form" and the user is
 *    guided through the real process.
 */

export type RouteType = "primary" | "parallel" | "escalation"
export type RouteMethod = "email" | "form" | "post"

export interface GeneratedRoute {
  routeType: RouteType
  organizationName: string
  purpose: string
  method: RouteMethod
  contactEmail: string | null
  contactAddress: string | null
  formUrl: string | null
  sourceUrl: string | null
  condition: string | null
  unlockAfterDays: number | null
  requiresNoResolution: boolean
  deadlineNote: string | null
}

const SYSTEM_PROMPT = `You map out every legitimate route a UK complaint can take. You use web search and you do not invent anything.

For the issue given, identify the routes available, each as one entry.

ROUTE TYPES
- "primary": the organisation complained about. Normally exactly one. Send now.
- "parallel": send NOW, alongside the primary, because it serves a DIFFERENT purpose — not an escalation of the same complaint. Examples: reporting a vehicle safety defect to the DVSA while pursuing redress from the manufacturer; reporting a data breach to the ICO; reporting a workplace safety risk to the HSE. Only use this where the purpose genuinely differs.
- "escalation": the same complaint, taken further, ONLY once the organisation has had its chance. Ombudsmen and most regulators sit here.

THE RULE THAT MATTERS MOST
Most regulators and ombudsmen will REJECT a complaint that has not exhausted the organisation's internal process. The Financial Ombudsman and Legal Ombudsman generally require 8 weeks. The IOPC generally requires local resolution first. The SRA takes misconduct, not service complaints, and normally expects the firm to have been approached. Reflect this: give escalation routes an unlockAfterDays and a condition in plain English. Do NOT mark something parallel just to make it available sooner.

METHOD
- "email": a complaint letter can be emailed to a published address.
- "form": the body requires its own form or process, so a letter cannot be emailed. ACAS Early Conciliation, DVSA defect reports, IOPC online forms, ICO reporting. Give the formUrl.
- "post": postal only.

DEADLINES
Where a statutory time limit applies, put it in deadlineNote in plain English. Examples: ACAS Early Conciliation must be started within 3 months less one day of the incident for an employment tribunal claim; Financial Ombudsman complaints must generally be brought within 6 months of the firm's final response. Getting this wrong can cost someone their claim, so state it whenever one exists and leave it null when you are unsure.

VERIFICATION
Search the web for every contact detail. Only report what you have seen on a page. Use null for anything you cannot verify and put the page you used in sourceUrl. Never construct an address from an organisation's name. An invented address on a legal complaint is worse than no address.

Return ONLY valid JSON, no markdown:
{
  "routes": [
    {
      "routeType": "primary" | "parallel" | "escalation",
      "organizationName": "Who this goes to",
      "purpose": "One sentence: what this route achieves and why it exists",
      "method": "email" | "form" | "post",
      "contactEmail": "verified email or null",
      "contactAddress": "verified postal address including postcode, or null",
      "formUrl": "official process URL if method is form, else null",
      "sourceUrl": "page these details came from",
      "condition": "Plain English unlock condition for escalation routes, else null",
      "unlockAfterDays": number of days after the primary is sent, or null,
      "requiresNoResolution": true if it only applies when unresolved,
      "deadlineNote": "Any statutory deadline in plain English, or null"
    }
  ]
}

Return at most 6 routes. Order them: primary, then parallel, then escalation soonest-first.`

export async function generateRoutes(params: {
  issueCategory: string
  issueType: string
  description: string
  organization: string
  individual?: string | null
  location: string
  dateOfIncident: string
  subscriptionTier?: string | null
  knownRecipientEmail?: string | null
}): Promise<GeneratedRoute[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const config = getAnalysisConfig(params.subscriptionTier)

  const userMessage = [
    `Map the complaint routes for this UK issue.`,
    ``,
    `Category: ${params.issueCategory}`,
    `Type: ${params.issueType}`,
    `Organisation complained about: ${params.organization}`,
    params.individual ? `Individual involved: ${params.individual}` : null,
    `Location: ${params.location}`,
    `Date of incident: ${params.dateOfIncident}`,
    params.knownRecipientEmail
      ? `A verified contact for the organisation is already known: ${params.knownRecipientEmail}`
      : `No verified contact for the organisation is known yet.`,
    ``,
    `What happened:`,
    params.description,
  ]
    .filter((l) => l !== null)
    .join("\n")

  const message = await client.beta.messages.create({
    model: config.model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }],
    output_config: { effort: "low" },
  })

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []

  let parsed: { routes?: unknown }
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    console.warn("Route generation returned unparseable JSON")
    return []
  }

  if (!Array.isArray(parsed.routes)) return []

  const str = (v: unknown) => (v && String(v).trim() ? String(v).trim() : null)

  return parsed.routes.slice(0, 6).map((raw) => {
    const r = raw as Record<string, unknown>
    const routeType: RouteType =
      r.routeType === "primary" || r.routeType === "parallel" || r.routeType === "escalation"
        ? r.routeType
        : "escalation"
    const method: RouteMethod =
      r.method === "email" || r.method === "form" || r.method === "post" ? r.method : "email"

    return {
      routeType,
      organizationName: str(r.organizationName) || "Unknown",
      purpose: str(r.purpose) || "",
      method,
      contactEmail: str(r.contactEmail),
      contactAddress: str(r.contactAddress),
      formUrl: str(r.formUrl),
      sourceUrl: str(r.sourceUrl),
      condition: str(r.condition),
      unlockAfterDays:
        typeof r.unlockAfterDays === "number" && r.unlockAfterDays > 0
          ? Math.round(r.unlockAfterDays)
          : null,
      requiresNoResolution: r.requiresNoResolution === true,
      deadlineNote: str(r.deadlineNote),
    }
  })
}

/**
 * Whether an escalation route is open yet, given what has happened to the
 * primary complaint.
 *
 * Primary and parallel routes are always available — parallel routes serve a
 * different purpose and are not gated on the organisation replying.
 */
export function computeRouteStatus(
  route: {
    routeType: string
    unlockAfterDays: number | null
    requiresNoResolution: boolean
    sentAt: Date | null
  },
  primary: { sentAt: Date | null; respondedAt: Date | null } | null,
  now: Date = new Date()
): { status: "locked" | "available" | "sent"; availableAt: Date | null; reason: string | null } {
  if (route.sentAt) return { status: "sent", availableAt: null, reason: null }

  if (route.routeType !== "escalation") {
    return { status: "available", availableAt: null, reason: null }
  }

  // An escalation is meaningless until the organisation has actually been asked.
  if (!primary?.sentAt) {
    return {
      status: "locked",
      availableAt: null,
      reason: "Send your complaint to the organisation first",
    }
  }

  if (route.requiresNoResolution && primary.respondedAt) {
    return {
      status: "available",
      availableAt: null,
      reason: "They have replied — escalate if you are not satisfied with their response",
    }
  }

  if (route.unlockAfterDays) {
    const availableAt = new Date(
      primary.sentAt.getTime() + route.unlockAfterDays * 24 * 60 * 60 * 1000
    )
    if (now < availableAt) {
      const days = Math.ceil((availableAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      return {
        status: "locked",
        availableAt,
        reason: `Available in ${days} day${days === 1 ? "" : "s"}`,
      }
    }
    return { status: "available", availableAt, reason: null }
  }

  return { status: "available", availableAt: null, reason: null }
}
