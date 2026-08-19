import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  validateFileUpload,
  generateFileKey,
  generatePresignedUploadUrl,
  isS3Configured,
} from "@/lib/s3"
import { getEffectiveTier } from "@/lib/subscription"

const VALID_FOLDERS = ["evidence", "documents", "general"] as const

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isS3Configured()) {
      console.error(
        "[upload] S3 is not configured — set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, " +
          "AWS_REGION and AWS_S3_BUCKET in .env and in Vercel. See S3-SETUP-GUIDE.md."
      )
      return NextResponse.json(
        { error: "File uploads are temporarily unavailable. Your issue will still be saved." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { fileName, fileSize, contentType, folder, issueId, caseId } = body

    // Validate required fields
    if (!fileName || !fileSize || !contentType || !folder) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, fileSize, contentType, folder" },
        { status: 400 }
      )
    }

    // Validate folder
    if (!VALID_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { error: `Invalid folder. Must be one of: ${VALID_FOLDERS.join(", ")}` },
        { status: 400 }
      )
    }

    // Look up user's subscription tier
    const userId = parseInt(session.user.id)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true, subscriptionStatus: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Use the effective tier, not the raw column — several accounts carry
    // subscriptionTier "basic" with subscriptionStatus "free" (and cancelled
    // subscribers keep their old tier value), so the raw column would hand
    // out paid file limits to users who aren't paying.
    const tier = getEffectiveTier(user.subscriptionTier ?? "free", user.subscriptionStatus)

    // Validate file against tier restrictions
    const validation = validateFileUpload(fileName, fileSize, contentType, tier)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate S3 key and presigned upload URL
    const fileKey = generateFileKey(userId, folder, fileName)
    const uploadUrl = await generatePresignedUploadUrl(
      fileKey,
      contentType,
      fileSize
    )

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        fileKey,
        expiresIn: 600,
      },
    })
  } catch (error) {
    console.error("Error generating upload URL:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
