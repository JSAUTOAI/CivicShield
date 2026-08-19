/**
 * Client-side evidence upload.
 *
 * Three steps per file, matching the existing API:
 *   1. POST /api/upload           → validates against the user's tier, returns a presigned S3 PUT
 *   2. PUT  <presigned url>       → the bytes go straight to S3, never through our server
 *   3. POST /api/upload/complete  → creates the EvidenceItem row against the issue
 *
 * Step 3 needs an issueId, so uploads can only run once the issue exists.
 *
 * Uses XMLHttpRequest for step 2 because fetch() gives no upload progress —
 * evidence files can be large (the Agency tier allows 2GB), and a long silent
 * bar is how people conclude an upload has hung and give up.
 */

export type UploadStatus = "pending" | "uploading" | "done" | "error"

export interface UploadResult {
  ok: boolean
  error?: string
}

function putWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", file.type)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Storage rejected the file (HTTP ${xhr.status})`))
    xhr.onerror = () => reject(new Error("Network error while uploading"))
    xhr.onabort = () => reject(new Error("Upload cancelled"))

    xhr.send(file)
  })
}

/**
 * Upload one file and attach it to an issue as an EvidenceItem.
 * Never throws — returns { ok: false, error } so one bad file doesn't abort a batch.
 */
export async function uploadEvidenceFile(
  file: File,
  opts: {
    issueId: number
    folder?: "evidence" | "documents" | "general"
    onProgress?: (percent: number) => void
  }
): Promise<UploadResult> {
  const { issueId, folder = "evidence", onProgress } = opts

  try {
    const presignRes = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || "application/octet-stream",
        folder,
        issueId,
      }),
    })

    const presignBody = await presignRes.json().catch(() => ({}))
    if (!presignRes.ok) {
      return { ok: false, error: presignBody.error || "Could not prepare the upload" }
    }

    const fileKey: string | undefined = presignBody.data?.fileKey
    const uploadUrl: string | undefined = presignBody.data?.uploadUrl
    if (!fileKey || !uploadUrl) {
      return { ok: false, error: "Storage is not configured — contact support" }
    }

    await putWithProgress(uploadUrl, file, onProgress ?? (() => {}))

    // Until this succeeds the file exists in S3 but nothing references it.
    const completeRes = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        issueId,
      }),
    })

    if (!completeRes.ok) {
      const body = await completeRes.json().catch(() => ({}))
      return { ok: false, error: body.error || "Uploaded, but could not be attached" }
    }

    onProgress?.(100)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

/** Human-readable file size, for limit messages and the file list. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
