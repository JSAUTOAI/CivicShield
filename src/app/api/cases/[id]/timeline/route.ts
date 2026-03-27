import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/cases/[id]/timeline — list timeline events for case
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

    const timeline = await db.caseTimeline.findMany({
      where: { caseId },
      orderBy: { eventDate: "desc" },
    })

    return NextResponse.json(timeline)
  } catch (error) {
    console.error("Error fetching timeline:", error)
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 })
  }
}

// POST /api/cases/[id]/timeline — create timeline event
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
    const { eventType, eventTitle, eventDescription, eventDate, eventTime, location, importance, isDeadline } = body

    if (!eventType || !eventTitle || !eventDate) {
      return NextResponse.json(
        { error: "Missing required fields: eventType, eventTitle, eventDate" },
        { status: 400 }
      )
    }

    const event = await db.caseTimeline.create({
      data: {
        caseId,
        eventType,
        eventTitle,
        eventDescription: eventDescription || null,
        eventDate: new Date(eventDate),
        eventTime: eventTime || null,
        location: location || null,
        importance: importance || "medium",
        isDeadline: isDeadline || false,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating timeline event:", error)
    return NextResponse.json({ error: "Failed to create timeline event" }, { status: 500 })
  }
}
