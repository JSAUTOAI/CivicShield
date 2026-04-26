# Plan: Editable Recipient Block on Generated Complaints

## Context

When the AI generates a complaint letter and **fails to find** the target organisation's email/address (e.g. `Revive Exterior Cleaning Solutions — Not provided - recommend finding via company website or business registration`), the recipient block is rendered **read-only**. The user can edit the letter body, but has no way to add the recipient email — so clicking **Send Complaint** silently falls back to `sentVia: "manual"` and nothing is actually emailed. The only escape is to regenerate the whole complaint, which is friction-heavy and a likely cause of paid-tier drop-off.

The fix is purely UI. Backend, schema, and validation already support updating recipient fields end-to-end (`Complaint.recipientName/Email/Address/Org` in [schema.prisma:166-193](civicshield/prisma/schema.prisma#L166-L193); `complaintUpdateSchema` in [validations.ts:50-65](civicshield/src/lib/validations.ts#L50-L65); PATCH merge logic in [complaints/[id]/route.ts:95-140](civicshield/src/app/api/complaints/[id]/route.ts#L95-L140)). The send path already prefers a freshly-PATCHed `recipientEmail` over the existing record.

## Design Decisions

1. **Inline expandable editor**, not a modal — fits the small `text-xs` recipient block, lower friction than a popup, matches the `settings/page.tsx` "local state + Input + PATCH + toast" pattern in [settings/page.tsx:79-132](civicshield/src/app/(dashboard)/settings/page.tsx#L79-L132).
2. **Auto-expand when `recipientEmail` is empty/null** — the high-friction case. Collapsed (chevron + summary) when all four fields are populated. One-time auto-expand per page load (use a ref so manual collapse sticks).
3. **Scope to [issues/[id]/page.tsx](civicshield/src/app/(dashboard)/issues/[id]/page.tsx) only** — the case-overview shows the same read-only block but is a status summary, not an edit surface. Users edit on the issue page; case overview can stay read-only this round.
4. **Don't auto-rewrite the letter body** — show a small hint ("💡 If you've added the recipient details above, update the letter body below to match.") when the user saves. Auto-regex on free-form prose is brittle; the body is already an editable textarea right beneath.
5. **Separate `handleSaveRecipient` handler** — keeps `handleSaveComplaint` focused on `complaintText`. Each PATCH sends only what changed.
6. **Lock when `status === "sent"`** — same rule the textarea already follows ([page.tsx:613](civicshield/src/app/(dashboard)/issues/[id]/page.tsx#L613)).
7. **Client-side email validation** — HTML5 `type="email"` + a simple regex check before PATCH; server zod (`.email()`) is the source of truth.

## Critical Files

- **[civicshield/src/app/(dashboard)/issues/[id]/page.tsx](civicshield/src/app/(dashboard)/issues/[id]/page.tsx)** — only file with code changes. Replace the static `<div>` at lines 601-608, add new state + handler near lines 105-110 / 154-170.

Read-only references (no changes, but verify behaviour during testing):
- [civicshield/src/app/api/complaints/[id]/route.ts:46-168](civicshield/src/app/api/complaints/[id]/route.ts#L46-L168) — PATCH already merges recipient fields and re-evaluates send path.
- [civicshield/src/lib/validations.ts:50-65](civicshield/src/lib/validations.ts#L50-L65) — server validates email shape.
- [civicshield/src/components/ui/input.tsx](civicshield/src/components/ui/input.tsx) — reused.

## Implementation Outline

### 1. New state + ref (near [page.tsx:105-110](civicshield/src/app/(dashboard)/issues/[id]/page.tsx#L105))

```ts
const [recipientName, setRecipientName] = React.useState("")
const [recipientOrg, setRecipientOrg] = React.useState("")
const [recipientEmail, setRecipientEmail] = React.useState("")
const [recipientAddress, setRecipientAddress] = React.useState("")
const [recipientExpanded, setRecipientExpanded] = React.useState(false)
const [savingRecipient, setSavingRecipient] = React.useState(false)
const [showBodyHint, setShowBodyHint] = React.useState(false)
const autoExpandedRef = React.useRef(false)
```

### 2. Sync effect (extend the existing one near [page.tsx:126-130](civicshield/src/app/(dashboard)/issues/[id]/page.tsx#L126))

When `latestComplaint` first loads, hydrate the four fields from `latestComplaint.recipientName/Org/Email/Address`. If `!latestComplaint.recipientEmail` and `latestComplaint.status === "draft"` and `!autoExpandedRef.current`, set `recipientExpanded = true` and `autoExpandedRef.current = true`. This way a user who manually collapses the section won't see it re-open.

### 3. New handler (near [page.tsx:154-170](civicshield/src/app/(dashboard)/issues/[id]/page.tsx#L154))

```ts
async function handleSaveRecipient() {
  if (!latestComplaint) return
  if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    toast.error("Please enter a valid email address")
    return
  }
  setSavingRecipient(true)
  try {
    const res = await fetch(`/api/complaints/${latestComplaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: recipientName || null,
        recipientOrg: recipientOrg || null,
        recipientEmail: recipientEmail || null,
        recipientAddress: recipientAddress || null,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Failed" }))
      throw new Error(body.error || "Failed to save recipient")
    }
    toast.success("Recipient details saved")
    setShowBodyHint(true)
    refetch()
  } catch (err) {
    toast.error((err as Error).message)
  } finally {
    setSavingRecipient(false)
  }
}
```

### 4. Replace the read-only block ([page.tsx:601-608](civicshield/src/app/(dashboard)/issues/[id]/page.tsx#L601-L608))

Replace with a single `RecipientEditor` JSX block (kept inline — small enough, no shared-component need) that:

- **Collapsed view** (when `!recipientExpanded`): single-line `To:` summary identical to today, plus a small `Edit` ghost button (Pencil icon) on the right that flips `recipientExpanded`. Disable the button when `latestComplaint.status === "sent"`.
- **Missing-email warning row** (always visible when `!latestComplaint.recipientEmail && status === "draft"`): muted amber row above the editor, e.g. `⚠ No recipient email yet — add one below to send by email instead of marking as manually sent.`
- **Expanded view** (when `recipientExpanded`): a 2-column grid (single column on mobile) of four `Input` fields:
  - `Recipient name` (e.g. *Complaints Manager*)
  - `Organisation`
  - `Email` — `type="email"`, with the warning copy as the field hint when blank
  - `Postal address` — short textarea-shaped input (use `Input` for now to stay tight)
  - Save button (`brand` variant, disabled while `savingRecipient` or `status === "sent"`)
  - Cancel button (ghost) — resets the four fields back from `latestComplaint` and collapses
- When `showBodyHint` is true and not yet sent, show one inline hint line directly above the existing textarea: `💡 You've updated the recipient — review the letter body below and update the addressee block if needed.` Dismiss when textarea content changes or on next save.

All four fields should be editable even when one is blank — server treats `null`/empty consistently.

### 5. No other handlers change

- `handleSaveComplaint` — unchanged; still PATCHes only `complaintText`.
- `handleSendComplaint` — unchanged; the route already pulls the most recent `recipientEmail` from the DB after a recipient save.

## Verification

1. **Start dev server**: `npm run dev` (port 3001 per [CLAUDE.md](civicshield/CLAUDE.md)).
2. **Reproduce the bug**: log in as `jake@example.com / CivicShield2024!`, create a new issue against an organisation with no metadata (or use an existing one), run analysis. Confirm the generated complaint shows the missing-email amber warning and the editor auto-expands.
3. **Edit + save recipient**: fill in all four fields, click Save. Toast appears. Refresh — values persist (PATCH worked, refetch worked).
4. **Email validation**: try saving with an obviously bad email (`foo@bar`) — toast error, no PATCH.
5. **Collapse/expand**: collapse, refresh page — expanded again only if email still missing; once filled, stays collapsed (auto-expand-once ref).
6. **Send path**: with `recipientEmail` populated, click Send Complaint. In the complaints DB row, confirm `sentVia: "email"` (assuming `RESEND_API_KEY` is configured) — vs. `sentVia: "manual"` before the fix.
7. **Sent-state lock**: after sending, Edit button is disabled; the editor cannot be expanded.
8. **Pre-existing complete complaint**: view a complaint where all four fields are already populated — collapsed by default, no warning, Edit button still works on demand.
9. **Body hint**: after saving recipient, hint appears above the textarea; typing in the textarea (or hitting Save body) clears it.

## Out of Scope (intentionally)

- No changes to [case-overview.tsx](civicshield/src/app/(dashboard)/cases/[id]/case-overview.tsx) — keep the case manager surface read-only this round.
- No auto-rewriting of the letter body to inject recipient details.
- No changes to the AI prompt in [ai-analysis.ts](civicshield/src/lib/ai-analysis.ts) — the AI doing its best is fine; this fix is the human-in-the-loop escape hatch.
- No new shared `RecipientEditor` component extracted — the JSX lives once, on the issue page. Extract later if/when we add the same editor to the case overview.
