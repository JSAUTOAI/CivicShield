import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { resolveActUrl, resolveCaseUrl } from "@/lib/legal-sources"

// GET /api/dictionary/:slug — single term detail with resolved links
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const term = await db.dictionaryTerm.findUnique({
      where: { slug },
    })

    if (!term) {
      return apiError("Term not found", 404)
    }

    // Resolve legislation URLs via existing legal-sources registry
    const relatedLegislation = term.relatedActNames.map((actName) => ({
      actName,
      url: resolveActUrl(actName),
    }))

    // Resolve case law URLs via existing legal-sources registry
    const relatedCases = term.relatedCaseNames.map((caseName) => ({
      caseName,
      url: resolveCaseUrl(caseName, ""),
    }))

    // Resolve see-also slugs to actual terms
    const relatedTerms = term.seeAlso.length > 0
      ? await db.dictionaryTerm.findMany({
          where: { slug: { in: term.seeAlso } },
          select: { term: true, slug: true, definition: true },
        })
      : []

    return apiSuccess({
      ...term,
      relatedLegislation,
      relatedCases,
      relatedTerms,
    })
  } catch (error) {
    console.error("Error fetching dictionary term:", error)
    return apiError("Failed to fetch dictionary term")
  }
}
