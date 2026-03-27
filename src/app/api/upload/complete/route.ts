import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Infer a human-readable document type from a MIME type.
 */
function inferDocumentType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("audio/")) return "audio_recording"
  if (mimeType.startsWith("video/")) return "video_recording"
  if (mimeType === "application/pdf") return "pdf_document"
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "word_document"
  if (mimeType === "text/plain") return "text_document"
  if (mimeType === "application/rtf" || mimeType === "text/rtf")
    return "rtf_document"
  return "other"
}

/**
 * Infer an evidence type from a MIME type.
 */
function inferEvidenceType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "photo"
  if (mimeType.startsWith("audio/")) return "audio"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType === "application/pdf") return "document"
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document"
  if (mimeType === "text/plain" || mimeType === "application/rtf" || mimeType === "text/rtf")
    return "document"
  return "other"
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fileKey, fileName, fileSize, mimeType, issueId, caseId, description } = body

    // Validate required fields
    if (!fileKey || !fileName || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields: fileKey, fileName, fileSize, mimeType" },
        { status: 400 }
      )
    }

    // Create the appropriate DB record based on context
    if (issueId) {
      const record = await db.evidenceItem.create({
        data: {
          issueId: parseInt(issueId),
          evidenceType: inferEvidenceType(mimeType),
          fileName,
          fileUrl: fileKey,
          fileSize,
          mimeType,
          description: description ?? null,
          verificationStatus: "pending",
          isAdmissible: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: record,
      })
    }

    if (caseId) {
      const record = await db.courtDocument.create({
        data: {
          caseId: parseInt(caseId),
          documentType: inferDocumentType(mimeType),
          documentTitle: fileName,
          fileUrl: fileKey,
          status: "draft",
        },
      })

      return NextResponse.json({
        success: true,
        data: record,
      })
    }

    // No issueId or caseId — return success with just the file key
    return NextResponse.json({
      success: true,
      data: {
        fileKey,
        fileName,
        fileSize,
        mimeType,
        description: description ?? null,
      },
    })
  } catch (error) {
    console.error("Error completing upload:", error)
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    )
  }
}
