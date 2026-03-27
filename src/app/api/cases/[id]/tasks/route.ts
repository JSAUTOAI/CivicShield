import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/cases/[id]/tasks — list tasks for case
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

    const tasks = await db.casePreparationTask.findMany({
      where: { caseId },
      orderBy: [{ isCompleted: "asc" }, { priority: "asc" }],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST /api/cases/[id]/tasks — create task
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
    const { taskCategory, taskTitle, taskDescription, priority, deadline } = body

    if (!taskCategory || !taskTitle) {
      return NextResponse.json(
        { error: "Missing required fields: taskCategory, taskTitle" },
        { status: 400 }
      )
    }

    const task = await db.casePreparationTask.create({
      data: {
        caseId,
        taskCategory,
        taskTitle,
        taskDescription: taskDescription || null,
        priority: priority || "medium",
        deadline: deadline ? new Date(deadline) : null,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
