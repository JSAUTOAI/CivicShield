import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { Prisma } from "@prisma/client"

// GET /api/dictionary — list/search dictionary terms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const letter = searchParams.get("letter")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))

    const where: Prisma.DictionaryTermWhereInput = {}

    if (category) {
      where.category = category
    }

    if (letter && letter.length === 1) {
      where.term = { startsWith: letter, mode: "insensitive" }
    }

    if (search) {
      where.OR = [
        { term: { contains: search, mode: "insensitive" } },
        { definition: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ]
    }

    const [terms, total] = await Promise.all([
      db.dictionaryTerm.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { term: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dictionaryTerm.count({ where }),
    ])

    // Get letter counts for A-Z bar
    const allTerms = await db.dictionaryTerm.findMany({
      select: { term: true },
    })
    const letterCounts: Record<string, number> = {}
    for (let i = 65; i <= 90; i++) {
      letterCounts[String.fromCharCode(i)] = 0
    }
    for (const t of allTerms) {
      const firstLetter = t.term[0]?.toUpperCase()
      if (firstLetter && letterCounts[firstLetter] !== undefined) {
        letterCounts[firstLetter]++
      }
    }

    return apiSuccess({
      terms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      letterCounts,
    })
  } catch (error) {
    console.error("Error fetching dictionary terms:", error)
    return apiError("Failed to fetch dictionary terms")
  }
}
