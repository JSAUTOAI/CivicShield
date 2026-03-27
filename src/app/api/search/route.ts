import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { auth } from "@/lib/auth"

// GET /api/search?q=term — unified search across issues, resources, dictionary
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
      return apiSuccess({ issues: [], resources: [], terms: [] })
    }

    const session = await auth()

    // Search in parallel
    const [issues, resources, terms] = await Promise.all([
      // Only search user's own issues if authenticated
      session?.user?.id
        ? db.issue.findMany({
            where: {
              userId: parseInt(session.user.id),
              OR: [
                { description: { contains: q, mode: "insensitive" } },
                { organization: { contains: q, mode: "insensitive" } },
                { issueType: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, issueType: true, organization: true, issueCategory: true, status: true },
            take: 5,
            orderBy: { createdAt: "desc" },
          })
        : [],

      db.resource.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, category: true, url: true },
        take: 5,
      }),

      db.dictionaryTerm.findMany({
        where: {
          OR: [
            { term: { contains: q, mode: "insensitive" } },
            { definition: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { slug: true, term: true, category: true, definition: true },
        take: 5,
      }),
    ])

    return apiSuccess({ issues, resources, terms })
  } catch (error) {
    console.error("Search error:", error)
    return apiError("Search failed")
  }
}
