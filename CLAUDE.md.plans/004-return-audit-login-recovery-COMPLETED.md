# CivicShield — Return-from-Break Audit & Restart Plan

## Context

Jake has been away from CivicShield for roughly four months. Last commit was **26 April 2026**; last real user signup was **11 June 2026**; the site has been quiet since. He is back at the PC, cannot log in, and could not find admin credentials in `.env`.

He asked for three things: (1) find his admin login, (2) a full read-only audit of everything built, outstanding, or half-finished, and (3) a fresh `README2.md` to act as the working document from today forward. No changes were to be made during the audit — none were.

**The headline finding:** there is no admin account, because there is no admin panel. No `/admin` routes exist, there is no `isAdmin`/`requireAdmin` check anywhere in `src/`, and all 29 users in the live Railway DB have `role: "user"`. The `role` column and a `RolePermission` table exist in the schema but nothing in the app reads them. Jake's real account is an ordinary user row.

Meanwhile the site **is live and has been quietly taking real signups** — 29 users, 44 issues, 52 complaints (11 actually emailed), 3 real petitions. That raises the stakes on three things currently shipped to those users: fake statistics on the landing page, fake petitions on `/petitions`, and a `/forgot-password` link on the login page that 404s.

---

## What the audit found

### Live production state (Railway DB, read 20 Aug 2026)

| Metric | Value |
|---|---|
| Users | 29 (last signup 11 Jun 2026) |
| Issues | 44 |
| Complaints | 52 — **11 sent**, 41 draft |
| `openedAt` recorded | **0** |
| `respondedAt` recorded | **0** |
| Legal analyses | 52 (real Claude output, good UK legal quality — not mock) |
| Petitions | 3 real (2 published) |
| Signatures | 2 |
| Dictionary terms | 100 · Submission targets | 39 · Resources | 7 |
| Evidence items | **0** (S3 keys blank in `.env`) |
| Paying subscribers | 1 — Jake's own account (`sub_1TIxPwFjoWPmBKblRjVvRlL0`, Basic, active to 5 Sep 2026) |

Real complaints did go out to real bodies — Humberside Police PSD, DWP, Financial Ombudsman, Nottinghamshire Police, Lowell, Wescot, Utility Warehouse, Jaguar Land Rover. That is genuine platform usage.

### Jake's accounts

- **id 6** — `psacc515@gmail.com` / username `jakeswain` — the real account. Basic tier, `subscriptionStatus: active`, last login 9 Apr 2026. Password is bcrypt-hashed and not recoverable.
- **id 1** — `jake@example.com` — seed account, password `CivicShield2024!`, last login 5 Apr 2026.

Neither is an admin, because admin does not exist as a concept in the running app.

### Confirmed breaks (not "unbuilt" — actually broken)

1. **Open-tracking webhook is blocked by auth middleware.** `/api/email/events` is fully implemented ([src/app/api/email/events/route.ts](civicshield/src/app/api/email/events/route.ts)) but is **not** in the `publicPaths` array in [src/middleware.ts:5-20](civicshield/src/middleware.ts#L5-L20). Every Resend event POST is redirected to `/login` before reaching the handler. This is the reason all 52 complaints have `openedAt: null`. Note `/api/email/inbound` *is* whitelisted — `events` was simply missed.
2. **`/forgot-password` is a dead link.** Rendered on the login page ([src/app/(auth)/login/page.tsx:127](civicshield/src/app/(auth)/login/page.tsx#L127)) and whitelisted in middleware, but **no page exists** → 404 for every locked-out user. `sendPasswordResetEmail()` exists in [src/lib/email.ts:132](civicshield/src/lib/email.ts#L132) and is **never called** by anything. `/reset-password` (the URL inside that email) doesn't exist either. Schema already has `resetPasswordToken` / `resetPasswordExpires`.
3. **Fake stats shown to real users.** [src/app/(public)/landing/page.tsx:63-65](civicshield/src/app/(public)/landing/page.tsx#L63-L65) claims "10,000+ Issues Tracked", "95% Complaint Response Rate", "500+ Organisations Monitored". Reality: 44 / 0% measured / 39 targets.
4. **`/petitions` renders hardcoded fake petitions.** A `const petitions = [...]` array of 4 invented petitions with invented signature counts at [src/app/(dashboard)/petitions/page.tsx:20](civicshield/src/app/(dashboard)/petitions/page.tsx#L20). The real `GET /api/petitions` endpoint exists and works; the page just never calls it. "Start a Petition" is a non-functional stub.

### Built and working

Auth (register/login/bcrypt/5-attempt lockout/email verification), issue wizard → Claude analysis → complaint generation, complaint editing + truth-confirmation + real Resend send, inbound reply webhook, editable recipient block (the Apr 26 work — completed and committed), Stripe checkout/portal/webhook (all three routes fully implemented — `PERSONAL.md` is out of date calling them stubs), tier limits in [src/lib/subscription.ts](civicshield/src/lib/subscription.ts), resources / dictionary / case law / rights / motoring hub, settings, light-dark mode. Every internal `href` resolves to a real page **except** `/forgot-password`.

### Not built (accurate list)

Admin panel · in-app notifications (no `Notification` model in schema) · create-petition UI · HTML complaint email template (plain-text only) · Svix signature verification on both webhooks (headers checked for presence, not cryptographically verified) · S3 evidence upload (code complete in [src/lib/s3.ts](civicshield/src/lib/s3.ts) + `/api/upload`, but `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` are **empty** in `.env`) · PDF export · follow-up generation · public accountability dashboard.

### Repo hygiene

Working tree clean, `main` in sync with `origin/main` at `edd47bb`. Four empty component directories (`components/complaints`, `forms`, `issues`, `resources`). A stray `whsec_...` value on the last line of `.env` outside any variable — harmless but should be identified or deleted.

---

## Plan

Order is deliberate: get Jake in, verify nothing rotted, then fix the four confirmed breaks. No new features. Per his answers: **DB password reset**, **no admin panel yet**, **fix the fake data now**.

### Step 1 — Health check before touching anything

Confirm the codebase still builds on the current toolchain after four months (Node 24 / Next 16 / Prisma 6):

```bash
cd "c:/Users/psacc/civic shield v2/civicshield"
npm run build     # prisma generate + next build
npm run dev       # port 3001
```

If the build fails, stop and fix that first — everything below assumes a working tree. Report the actual output either way.

### Step 2 — Get Jake back in (DB password reset)

Write a one-off script `scripts/reset-password.mjs` that takes an email + new password, bcrypt-hashes it (cost 10, matching [src/lib/auth.ts](civicshield/src/lib/auth.ts)), and updates the user row. Run it against `psacc515@gmail.com` (user id 6) with a password Jake chooses. Also clear `failedLoginAttempts` and `accountLocked` on that row.

Keep the script — it's the break-glass tool until Step 4 ships.

Jake confirms login at civicshield.co.uk before we proceed.

### Step 3 — Unblock open tracking (one line)

Add `"/api/email/events"` to `publicPaths` in [src/middleware.ts](civicshield/src/middleware.ts#L5-L20), directly below the existing `/api/email/inbound` entry. Then confirm the Resend dashboard actually has a webhook pointing at `https://civicshield.co.uk/api/email/events` subscribed to `email.opened` / `email.delivered` / `email.bounced` — the route being unreachable means it may never have been configured. If it isn't there, add it.

This is the fix that makes response tracking — the core value proposition — start producing data.

### Step 4 — Build the password reset flow

Reuses `sendPasswordResetEmail()` which already exists and is already wired for the `/reset-password?token=` URL shape.

- `POST /api/auth/forgot-password` — accepts email, always returns success (no account enumeration), generates a token into the existing `resetPasswordToken` / `resetPasswordExpires` columns with a 1-hour expiry, calls `sendPasswordResetEmail()`.
- `POST /api/auth/reset-password` — validates token + expiry, bcrypt-hashes the new password, writes to `PasswordHistory`, clears the token, resets `failedLoginAttempts` / `accountLocked`.
- `src/app/(auth)/forgot-password/page.tsx` and `src/app/(auth)/reset-password/page.tsx` — match the existing split-screen `(auth)` layout and the form pattern in [src/app/(auth)/login/page.tsx](civicshield/src/app/(auth)/login/page.tsx).
- Add both new API paths to `publicPaths` in middleware. `/reset-password` too (only `/forgot-password` is currently listed).
- Validation via Zod in [src/lib/validations.ts](civicshield/src/lib/validations.ts), following the existing schemas there.

### Step 5 — Replace the fake data

**Landing stats** — add a small public `GET /api/stats` returning live counts (users, issues, complaints sent, organisations targeted), and have [src/app/(public)/landing/page.tsx](civicshield/src/app/(public)/landing/page.tsx#L63-L65) render those. Where a real number is embarrassing or unmeasurable (response rate is currently 0), drop that tile rather than inventing one — three honest tiles beat three fictional ones, and with 29 real users the current claims are a genuine credibility and advertising-standards risk.

**Petitions** — delete the hardcoded `const petitions` array and fetch from the existing `GET /api/petitions` using the `useFetch` hook from [src/lib/hooks.ts](civicshield/src/lib/hooks.ts), matching how [src/app/(dashboard)/issues/page.tsx](civicshield/src/app/(dashboard)/issues/page.tsx) does it. Add loading / empty states using the existing `LoadingSkeleton` and `EmptyState` components. The "Start a Petition" button stays a stub for now but should be visibly disabled with a "coming soon" tooltip rather than silently doing nothing.

### Step 6 — Write README2.md

New file at `civicshield/README2.md`, becoming the single working document from today forward. It carries the audit above (live DB numbers, what works, what's broken, what's unbuilt), plus a running "current state / next up" section. Leaves the existing `README.md`, `CLAUDE.md`, and `PERSONAL.md` untouched. Also correct the two stale claims in `PERSONAL.md` (Stripe routes are built; petitions page still hardcoded is still accurate).

### Deliberately not doing now

Admin panel · Svix signature verification · S3 keys · HTML email template · create-petition UI · notifications · follow-ups. All recorded in README2.md as the backlog.

---

## Verification

1. `npm run build` completes clean; `npm run dev` serves on :3001.
2. Jake logs in at civicshield.co.uk with the new password on his real account (id 6) and sees his Basic subscription in `/settings`.
3. `/forgot-password` loads, submitting a real address delivers a reset email via Resend, the link opens `/reset-password`, and the new password logs in. Test against a throwaway address, not a real user's.
4. Resend webhook test-send to `/api/email/events` returns `200` (not a `307` to `/login`). Then send one real complaint end-to-end and confirm `openedAt` populates in the DB once opened.
5. `/petitions` shows the 3 real DB petitions with real signature counts, not the 4 invented ones.
6. Landing page tiles match a live query against the DB.
7. `git status` clean, committed, pushed to `origin/main`.
