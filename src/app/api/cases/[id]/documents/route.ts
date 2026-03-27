import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/cases/[id]/documents — list documents for case
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const caseId = parseInt(id)

    // Verify case ownership
    const legalCase = await db.legalCase.findFirst({
      where: { id: caseId, userId: parseInt(session.user.id) },
    })

    if (!legalCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const documents = await db.courtDocument.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

// POST /api/cases/[id]/documents — create document
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const caseId = parseInt(id)

    // Verify case ownership
    const legalCase = await db.legalCase.findFirst({
      where: { id: caseId, userId: parseInt(session.user.id) },
    })

    if (!legalCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const body = await request.json()
    const { documentType, documentTitle, documentContent, fileUrl, status } = body

    if (!documentType || !documentTitle) {
      return NextResponse.json(
        { error: "Missing required fields: documentType, documentTitle" },
        { status: 400 }
      )
    }

    const document = await db.courtDocument.create({
      data: {
        caseId,
        documentType,
        documentTitle,
        documentContent: documentContent || null,
        fileUrl: fileUrl || null,
        status: status || "draft",
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}
