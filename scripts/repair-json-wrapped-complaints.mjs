/**
 * One-off repair for complaints stored as raw JSON.
 *
 * For a short window the letter was requested as JSON and, when that JSON
 * failed to parse, the raw string was saved verbatim — so the user saw
 * {"complaintText": "...\n\n..."} with visible escape sequences instead of a
 * letter. The generator now asks for plain text, but rows written during that
 * window are still wrong.
 *
 * Unwraps them in place. Originals are written to a backup file first so the
 * change is reversible. Safe to run more than once — rows that already look
 * like letters are skipped.
 *
 * Usage:
 *   node --env-file=.env scripts/repair-json-wrapped-complaints.mjs          (dry run)
 *   node --env-file=.env scripts/repair-json-wrapped-complaints.mjs --apply
 */

import { PrismaClient } from "@prisma/client"
import fs from "fs"

const APPLY = process.argv.includes("--apply")
const db = new PrismaClient()

function unwrapLetter(content) {
  const trimmed = content.trim()
  const fenced = trimmed.match(/^```(?:json|text)?\s*\n([\s\S]*?)\n?```$/)
  const body = fenced ? fenced[1].trim() : trimmed
  if (!body.startsWith("{") || !body.includes('"complaintText"')) return body

  try {
    const parsed = JSON.parse(body)
    if (parsed.complaintText) return parsed.complaintText
  } catch {
    const match = body.match(/"complaintText"\s*:\s*"([\s\S]*)$/)
    if (match) {
      return match[1]
        .replace(/"\s*\}?\s*$/, "")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .trim()
    }
  }
  return body
}

try {
  const all = await db.complaint.findMany({
    select: { id: true, issueId: true, complaintText: true, status: true },
  })

  const broken = all.filter(
    (c) => c.complaintText && c.complaintText.trimStart().startsWith("{")
  )

  console.log(`${all.length} complaints, ${broken.length} stored as raw JSON`)

  if (broken.length === 0) {
    console.log("Nothing to repair.")
  } else {
    const backupPath = `complaint-backup-${broken.map((c) => c.id).join("-")}.json`

    if (APPLY) {
      fs.writeFileSync(backupPath, JSON.stringify(broken, null, 2))
      console.log(`Originals backed up to ${backupPath}`)
    }

    for (const c of broken) {
      const fixed = unwrapLetter(c.complaintText)
      const ok = !fixed.trimStart().startsWith("{") && fixed.length > 200

      console.log(
        `  complaint ${c.id} (issue ${c.issueId}, ${c.status}): ` +
          `${c.complaintText.length} -> ${fixed.length} chars ` +
          `${ok ? "OK" : "COULD NOT RECOVER — left alone"}`
      )

      if (APPLY && ok) {
        await db.complaint.update({
          where: { id: c.id },
          data: { complaintText: fixed },
        })
      }
    }

    console.log(
      APPLY ? "Repaired." : "Dry run — nothing written. Re-run with --apply to fix."
    )
  }
} finally {
  await db.$disconnect()
}
