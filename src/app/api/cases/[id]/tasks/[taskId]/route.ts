import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// PATCH /api/cases/[id]/tasks/[taskId] — toggle task completion
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, taskId } = await params
    const caseId = parseInt(id)
    const taskIdNum = parseInt(taskId)

    // Verify case ownership
    const legalCase = await db.legalCase.findFirst({
      where: { id: caseId, userId: parseInt(session.user.id) },
    })

    if (!legalCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Verify task belongs to case
    const existingTask = await db.casePreparationTask.findFirst({
      where: { id: taskIdNum, caseId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const body = await request.json()
    const { isCompleted } = body

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "isCompleted must be a boolean" },
        { status: 400 }
      )
    }

    const task = await db.casePreparationTask.update({
      where: { id: taskIdNum },
      data: {
        isCompleted,
        completedDate: isCompleted ? new Date() : null,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
