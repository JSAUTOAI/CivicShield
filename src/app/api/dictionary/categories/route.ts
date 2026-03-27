import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"

// GET /api/dictionary/categories — distinct categories with counts
export async function GET() {
  try {
    const results = await db.dictionaryTerm.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { category: "asc" },
    })

    const categories = results.map((r) => ({
      value: r.category,
      label: r.category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      count: r._count.category,
    }))

    return apiSuccess(categories)
  } catch (error) {
    console.error("Error fetching dictionary categories:", error)
    return apiError("Failed to fetch dictionary categories")
  }
}
