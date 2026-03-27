import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// ── Environment ──────────────────────────────────────────────────────
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!
const AWS_REGION = process.env.AWS_REGION!
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET!

// ── Singleton S3 Client ──────────────────────────────────────────────
let s3Client: S3Client | null = null

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })
  }
  return s3Client
}

// ── Presigned URLs ───────────────────────────────────────────────────

/**
 * Generate a presigned PUT URL for uploading a file to S3.
 * Expires in 10 minutes (600 seconds).
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number
): Promise<string> {
  const client = getS3Client()
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSizeBytes,
  })
  return getSignedUrl(client, command, { expiresIn: 600 })
}

/**
 * Generate a presigned GET URL for downloading a file from S3.
 * Expires in 1 hour (3600 seconds).
 */
export async function generatePresignedDownloadUrl(
  key: string
): Promise<string> {
  const client = getS3Client()
  const command = new GetObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
  })
  return getSignedUrl(client, command, { expiresIn: 3600 })
}

// ── Delete ───────────────────────────────────────────────────────────

export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client()
  const command = new DeleteObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
  })
  await client.send(command)
}

// ── Key Generation ───────────────────────────────────────────────────

/**
 * Generates a unique S3 object key:
 *   users/{userId}/{folder}/{timestamp}-{sanitized-fileName}
 */
export function generateFileKey(
  userId: number,
  folder: string,
  fileName: string
): string {
  const timestamp = Date.now()
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase()
  return `users/${userId}/${folder}/${timestamp}-${sanitized}`
}

// ── Validation ───────────────────────────────────────────────────────

type Tier = "free" | "basic" | "pro" | "agency"

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
]

const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf",
  "text/rtf",
]

const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-m4a",
  "audio/m4a",
  "audio/ogg",
]

const VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
]

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "heic"]
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "txt", "rtf"]
const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "ogg"]
const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "webm"]

const ALLOWED_TYPES_BY_TIER: Record<Tier, string[]> = {
  free: [...IMAGE_TYPES, ...DOCUMENT_TYPES],
  basic: [...IMAGE_TYPES, ...DOCUMENT_TYPES],
  pro: [...IMAGE_TYPES, ...DOCUMENT_TYPES, ...AUDIO_TYPES, ...VIDEO_TYPES],
  agency: [...IMAGE_TYPES, ...DOCUMENT_TYPES, ...AUDIO_TYPES, ...VIDEO_TYPES],
}

const ALLOWED_EXTENSIONS_BY_TIER: Record<Tier, string[]> = {
  free: [...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS],
  basic: [...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS],
  pro: [
    ...IMAGE_EXTENSIONS,
    ...DOCUMENT_EXTENSIONS,
    ...AUDIO_EXTENSIONS,
    ...VIDEO_EXTENSIONS,
  ],
  agency: [
    ...IMAGE_EXTENSIONS,
    ...DOCUMENT_EXTENSIONS,
    ...AUDIO_EXTENSIONS,
    ...VIDEO_EXTENSIONS,
  ],
}

const MAX_FILE_SIZE_BYTES: Record<Tier, number> = {
  free: 25 * 1024 * 1024, // 25 MB
  basic: 50 * 1024 * 1024, // 50 MB
  pro: 200 * 1024 * 1024, // 200 MB
  agency: 2048 * 1024 * 1024, // 2 GB
}

/**
 * Validate a file upload against the user's subscription tier.
 */
export function validateFileUpload(
  fileName: string,
  fileSize: number,
  mimeType: string,
  tier: string
): { valid: boolean; error?: string } {
  const t = (tier as Tier) || "free"

  // Check file extension
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  const allowedExtensions = ALLOWED_EXTENSIONS_BY_TIER[t] ?? ALLOWED_EXTENSIONS_BY_TIER.free
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} is not allowed on the ${t} tier. Allowed: ${allowedExtensions.join(", ")}`,
    }
  }

  // Check MIME type
  const allowedTypes = ALLOWED_TYPES_BY_TIER[t] ?? ALLOWED_TYPES_BY_TIER.free
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `MIME type ${mimeType} is not allowed on the ${t} tier.`,
    }
  }

  // Check file size
  const maxSize = MAX_FILE_SIZE_BYTES[t] ?? MAX_FILE_SIZE_BYTES.free
  if (fileSize > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size ${Math.round(fileSize / (1024 * 1024))}MB exceeds the ${maxMB}MB limit for the ${t} tier.`,
    }
  }

  return { valid: true }
}
