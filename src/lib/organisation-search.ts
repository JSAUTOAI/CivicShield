import Anthropic from "@anthropic-ai/sdk"
import { getAnalysisConfig } from "@/lib/ai-analysis"

/**
 * Look up an organisation's real complaints contact details.
 *
 * This used to ask Claude to recall the details from memory, with the model
 * pinned to a since-retired ID — so in practice it returned a 404 on every
 * call and no organisation was ever found. Worse, the complaint drafter was
 * separately told to "research and include the most likely complaints
 * department address and email", which with no web access means invent one.
 * That is how a complaint ended up addressed to info@ten21.co.uk, an address
 * nobody had verified.
 *
 * Contact details are now found with the web search tool and every candidate
 * carries the source URL it came from, so the user can check it before
 * sending. Anything unverified is returned as null rather than guessed at —
 * a legal complaint sent to a made-up address is worse than no address.
 */

export interface OrganisationCandidate {
  organizationName: string
  organizationType: string
  department: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
  websiteUrl: string | null
  complaintUrl: string | null
  region: string | null
  jurisdiction: string | null
  responseTimeDays: number | null
  escalationPath: string[]
  /** Page the details were taken from, so the user can verify them. */
  sourceUrl: string | null
  /** How confident the search was that this is the right organisation. */
  confidence: "high" | "medium" | "low"
  /** Why this candidate was included — shown to help the user choose. */
  note: string | null
}

const SYSTEM_PROMPT = `You find real, verifiable complaints contact details for UK organisations, using web search.

RULES — these matter more than being helpful:
- Search the web. Do not answer from memory.
- Only report a contact detail you have actually seen on a page you fetched.
- If you cannot verify a field, return null for it. Never guess, never construct a plausible-looking address such as info@<company>.co.uk.
- An unverified email address is worse than none at all: the user sends formal legal complaints to these addresses.
- Prefer a dedicated complaints address over a general enquiries one, but a verified general address beats an invented complaints one.
- Always include the sourceUrl you took the details from.
- If several different organisations share the name, return each as a separate candidate so the user can pick.
- Small local businesses often have no published complaints department. Returning one candidate with mostly nulls and a note saying so is the correct answer.

Return ONLY valid JSON, no markdown, no commentary:
{
  "candidates": [
    {
      "organizationName": "Official name as published",
      "organizationType": "public_sector" | "business" | "legal" | "regulatory" | "other",
      "department": "Complaints department name, or null",
      "contactEmail": "Verified email, or null",
      "contactPhone": "Verified phone, or null",
      "contactAddress": "Full verified postal address including postcode, or null",
      "websiteUrl": "Official website, or null",
      "complaintUrl": "Complaints page URL, or null",
      "region": "e.g. England and Wales, or null",
      "jurisdiction": "e.g. Wales, or null",
      "responseTimeDays": number or null,
      "escalationPath": ["Ordered list of escalation bodies, or empty"],
      "sourceUrl": "The page these details came from",
      "confidence": "high" | "medium" | "low",
      "note": "One short line: which branch/entity this is, or what could not be verified"
    }
  ]
}

Return at most 4 candidates, best match first. If nothing can be verified, return "candidates": [].`

export async function searchOrganisation(params: {
  organizationName: string
  issueCategory?: string | null
  location?: string | null
}): Promise<OrganisationCandidate[]> {
  const { organizationName, issueCategory, location } = params

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  // Reuse the paid-tier model choice; lookups are short so cost is modest.
  const config = getAnalysisConfig("pro")

  const userMessage = [
    `Find the complaints contact details for this UK organisation: "${organizationName}".`,
    location ? `The user is dealing with them in or near: ${location}.` : null,
    issueCategory ? `The complaint category is: ${issueCategory}.` : null,
    "Search the web and verify every detail against a real page.",
  ]
    .filter(Boolean)
    .join("\n")

  const message = await client.beta.messages.create({
    model: config.model,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
    output_config: { effort: "low" },
  })

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []

  let parsed: { candidates?: unknown }
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    console.warn("Organisation search returned unparseable JSON")
    return []
  }

  if (!Array.isArray(parsed.candidates)) return []

  return parsed.candidates.slice(0, 4).map((raw) => {
    const c = raw as Record<string, unknown>
    const str = (v: unknown) => (v && String(v).trim() ? String(v).trim() : null)
    return {
      organizationName: str(c.organizationName) || organizationName,
      organizationType: str(c.organizationType) || "other",
      department: str(c.department),
      contactEmail: str(c.contactEmail),
      contactPhone: str(c.contactPhone),
      contactAddress: str(c.contactAddress),
      websiteUrl: str(c.websiteUrl),
      complaintUrl: str(c.complaintUrl),
      region: str(c.region),
      jurisdiction: str(c.jurisdiction),
      responseTimeDays: typeof c.responseTimeDays === "number" ? c.responseTimeDays : null,
      escalationPath: Array.isArray(c.escalationPath) ? c.escalationPath.map(String) : [],
      sourceUrl: str(c.sourceUrl),
      confidence:
        c.confidence === "high" || c.confidence === "medium" || c.confidence === "low"
          ? c.confidence
          : "low",
      note: str(c.note),
    }
  })
}
