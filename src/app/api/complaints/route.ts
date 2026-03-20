import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/complaints — list user's complaints
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const complaints = await db.complaint.findMany({
      where: {
        issue: {
          userId: parseInt(session.user.id),
        },
      },
      include: {
        issue: {
          select: {
            id: true,
            issueType: true,
            issueCategory: true,
            organization: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(complaints)
  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 })
  }
}
