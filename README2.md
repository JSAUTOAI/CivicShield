# CivicShield — Working Document (README2)

**Started:** 20 August 2026
**Supersedes:** nothing. `README.md`, `CLAUDE.md` (build rules), and `PERSONAL.md` (rebuild/backup reference) all stay as they are. This file is the running log of state and next actions from today forward.

---

## 1. Where things stood on 20 Aug 2026

Last commit before today: `edd47bb`, **26 April 2026**. Roughly four months idle.

The site stayed live on Vercel the whole time and kept taking real signups. Nothing had rotted — `npm run build` passed clean on the first attempt with the current toolchain (Node 24, Next 16, Prisma 6).

### Live production numbers (read from Railway, 20 Aug 2026)

| Metric | Value |
|---|---|
| Registered users | 29 (last signup 11 Jun 2026) |
| Issues logged | 44 |
| Complaints | 52 — **11 actually emailed**, 41 still draft |
| Complaints with `openedAt` | **0** ← was a bug, see §2.1 |
| Complaints with `respondedAt` | **0** |
| AI legal analyses | 52 (real Claude output, genuine UK legal citations — not mock) |
| Petitions | 3 (1 draft, 2 published) |
| Signatures | 2 |
| Dictionary terms / Submission targets / Resources | 100 / 39 / 7 |
| Evidence items | 0 (S3 keys never filled in) |
| Paying subscribers | 1 — Jake's own account |

Real complaints went to real bodies: Humberside Police PSD, DWP, Financial Ombudsman (×2), Nottinghamshire Police, Lowell, Wescot, Utility Warehouse, Jaguar Land Rover. The pipeline works end to end.

### Admin access — there is none

There is **no admin panel**. No `/admin` routes, no `isAdmin`/`requireAdmin` check anywhere in `src/`, and all 29 users have `role: "user"`. The `role` column and the `RolePermission` table exist in the schema but **nothing in the running app reads them**.

Jake's real account:

- **id 6** — `psacc515@gmail.com`, username `jakeswain`, Basic tier, `subscriptionStatus: active` to 5 Sep 2026 (`sub_1TIxPwFjoWPmBKblRjVvRlL0`).
- Also present: **id 1** `jake@example.com`, the original seed account (`CivicShield2024!`).

Both had `emailVerified: false`, which [src/lib/auth.ts:90-92](src/lib/auth.ts#L90-L92) treats as a hard block on sign-in — so neither could log in regardless of password. Fixed for id 6 on 20 Aug.

---

## 2. What was fixed on 20 Aug 2026

### 2.1 Open-tracking webhook was blocked by auth middleware ← the important one

`/api/email/events` was fully implemented but **missing from the `publicPaths` array** in [src/middleware.ts](src/middleware.ts). Every Resend event POST was redirected to `/login` before reaching the handler. `/api/email/inbound` *was* whitelisted; `events` was simply overlooked when it was added.

This is why all 52 complaints show `openedAt: null` and why no response data ever accumulated. One line to fix.

**Still to do outside the code:** confirm in the Resend dashboard that a webhook actually points at `https://civicshield.co.uk/api/email/events`, subscribed to `email.opened`, `email.delivered`, `email.bounced`. Because the endpoint was unreachable, it may never have been configured at all.

### 2.2 Password reset flow — built from scratch

`/forgot-password` was linked on the login page and whitelisted in middleware, but **the page did not exist** — a 404 for every locked-out user. `sendPasswordResetEmail()` had been sitting in [src/lib/email.ts](src/lib/email.ts) since April, never called by anything.

Added:
- `POST /api/auth/forgot-password` — 1-hour token into the existing `resetPasswordToken`/`resetPasswordExpires` columns, 2-minute rate limit, identical response whether or not the account exists (no email enumeration).
- `POST /api/auth/reset-password` — validates token + expiry, hashes at cost 12, writes `PasswordHistory`, clears the token, and **clears any login lockout** (otherwise a user who locked themselves out guessing still couldn't get in).
- `src/app/(auth)/forgot-password/page.tsx` and `.../reset-password/page.tsx`.
- `/reset-password` added to middleware `publicPaths`; success banner on the login page via `?reset=true`.
- `forgotPasswordSchema` / `resetPasswordSchema` in [src/lib/validations.ts](src/lib/validations.ts).

### 2.3 Fake statistics removed from the landing page

The landing page was telling real visitors "10,000+ Issues Tracked", "95% Complaint Response Rate", "500+ Organisations Monitored". Actual figures: 44 issues, response rate unmeasured (0 recorded), 39 organisations.

Now driven by live counts from `getPublicStats()` in [src/lib/stats.ts](src/lib/stats.ts), also exposed at `GET /api/stats`. Page revalidates every 5 minutes and stays statically prerendered.

Current tiles: **100** Legal Terms Explained · **39** Organisations Covered · **44** Issues Logged · **£0** Cost to Get Started.

The response-rate tile was **dropped rather than recalculated** — with zero tracked responses there is no honest number to show. Once §2.1 starts producing open/reply data it can come back as a real figure.

### 2.4 Petitions page wired to real data

The page rendered a hardcoded array of **5 invented petitions with invented signature counts** (3,247 · 7,891 · 1,456 · 2,103 · 1,200) while a working `GET /api/petitions` sat unused.

Now fetches real petitions via `useFetch`, with loading / error / empty states. Also:
- Draft petitions are excluded from the API (they're unpublished and shouldn't be signable).
- **Signature counts come from counting `Signature` rows, not the `currentCount` column.** Those two had drifted — both live petitions have 1 real signature but `currentCount: 0`, because the rows were carried over from the original Replit database before the sign endpoint existed.
- The Sign button now actually posts to `/api/petitions/[id]/sign`, and shows "Signed" (disabled) when the user has already signed.
- "Start a Petition" is now visibly **disabled with a "coming soon" title**, instead of being a button that silently did nothing.

### 2.5 Break-glass password reset script

`scripts/reset-password.mjs` — sets a password directly in the DB, bcrypt cost 12, and also clears the lockout and sets `emailVerified: true`. Kept as the recovery tool if auth ever breaks again.

```bash
node --env-file=.env scripts/reset-password.mjs <email> <newPassword>
```

---

## 3. Current state of the platform

### Working end to end
Registration · login (bcrypt cost 12, 5-attempt lockout, 30-min cooldown) · email verification · **password reset (new)** · issue wizard → Claude legal analysis → complaint generation · complaint editing · editable recipient block · statement-of-truth confirmation · real email send via Resend · inbound reply webhook · **open-tracking webhook (unblocked)** · Stripe checkout / portal / webhook · tier limits · resources · legal dictionary (100 terms) · case law · rights explorer · motoring hub · settings · light/dark mode · **live landing stats (new)** · **real petitions list (new)**.

Every internal link in the app now resolves to a real page.

### Not built
| Item | Notes |
|---|---|
| Admin panel | Deliberately deferred 20 Aug. `role` column and `RolePermission` table already exist to build on. Use `npm run db:studio` to read data meanwhile. |
| Create-petition UI | Button is disabled. `POST /api/petitions` already works. |
| In-app notifications | No `Notification` model in the schema yet. |
| HTML complaint email | Complaints send as plain text. Verification and reset emails are HTML. |
| Svix signature verification | Both webhooks check that svix headers are *present*, not that they're *valid*. |
| S3 evidence upload | Code complete in [src/lib/s3.ts](src/lib/s3.ts) + `/api/upload`. `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` are **empty** in `.env`. See `S3-SETUP-GUIDE.md`. |
| PDF export · follow-up generation · public accountability dashboard | Phase 3/4. |

### Housekeeping noticed, not actioned
- Four empty directories: `src/components/{complaints,forms,issues,resources}`.
- `.env` has a stray `whsec_...` value on the last line, outside any variable assignment. Harmless (shell/dotenv ignores it) but should be identified or removed.
- `PERSONAL.md` §1 is stale: it lists the Stripe routes as unbuilt. All three have been implemented since. Corrected in that file on 20 Aug.

---

## 3a. Deployed and verified on production — 20 Aug 2026

Commit `ac99c99` pushed to `origin/main`; Vercel redeployed. Checked live on https://www.civicshield.co.uk:

| Check | Result |
|---|---|
| `/forgot-password` | 200 (was a 404) |
| `/reset-password` | 200 (did not exist) |
| `GET /api/stats` | returns live counts |
| `POST /api/email/events` without svix headers | **401** — no longer redirected to `/login` |
| `POST /api/email/events` with svix headers | 200, handler reached |
| Landing page | old fake figures return 0 matches; tiles show 100 / 39 / 44 / £0 |
| Password reset on the live site | token issued for a real account |

Note: `civicshield.co.uk` 307-redirects to `www.civicshield.co.uk` for every path — that is pre-existing and normal, not a fault.

---

## 3b. Post-audit fixes — 20 Aug 2026 (commits `bff539f`, `653f99e`)

A full sweep of the codebase (every page mapped to its data source, every API
route checked for UI callers, every schema model checked for readers, pricing
claims checked against reality) turned up seven problems. Five are now fixed.

### Fixed

**Pricing honesty.** PDF export was sold as included on Pro (£14.99) and Agency
(£19.99), and bulk send on Agency. Neither exists in the codebase. Both are now
marked not-included on the pricing page and removed from the in-app upgrade
panel, until they ship.

**Webhook signatures are now verified.** Both `/api/email/inbound` and
`/api/email/events` previously checked only that the three `svix-*` header
*names* were present — anyone could post fake opens and replies into the
accountability data. New `src/lib/webhook-verify.ts` verifies properly via
`svix`, and both routes read the raw body before parsing (signatures are over
the exact bytes sent).

> **Action needed:** set `RESEND_WEBHOOK_SECRET` (Resend dashboard → Webhooks →
> your endpoint) in `.env` **and in Vercel**. Until then the old
> header-presence check still applies, with a warning logged on every request —
> chosen over hard-failing, which would have silently killed reply and open
> tracking on any deployment lacking the secret.

**Free-tier generation leak closed.** The free cap counted `lifetimeEmailSends`,
which only increments on *send* — so a free user who never pressed Send could
generate unlimited Claude analyses, each a paid API call (41 drafts vs 11 sends).
It now counts complaints generated.

Generations before the cutoff (the constant reads 2026-08-19; no complaints exist between then and now, so it behaves identically) are deliberately not counted. Applying it
retroactively would have locked three accounts out mid-use over a bug that was
ours; verified against the live DB that **no existing user is newly blocked**.

**Basic no longer has fewer features than Free.** `TIER_LIMITS.basic` was missing
`case-builder` entirely while `free` had it. Basic now carries
`case-builder-locked` (visible but not usable), per the launch decision.

**Evidence upload now actually uploads.** The wizard's file picker only called
`setUploadedFiles` — files stayed in React state, the review step said "N files
attached", and on submit they were discarded. `/api/upload` and
`/api/upload/complete` were fully written with zero callers. Now wired end to
end: presign → PUT to S3 → create `EvidenceItem`, running after issue creation
and before analysis, with per-file progress and an explicit failure count rather
than a redirect implying success.

Also fixed: `/api/upload` used the raw `subscriptionTier` column, so accounts
carrying tier `"basic"` with status `"free"` were handed paid file limits. Now
uses `getEffectiveTier`.

> **Action needed:** AWS keys. `S3-SETUP-GUIDE.md` has been corrected — it had
> the wrong dev port (3000, should be 3001), was missing
> `https://www.civicshield.co.uk` from the CORS origins (the site redirects to
> www, so uploads would have failed in production while working locally),
> recommended over-broad `AmazonS3FullAccess`, and never mentioned Vercel env
> vars. Until the keys are set, `/api/upload` returns a clear 503 and the user
> is told their issue was still saved.

### Still outstanding from the audit

- **PDF export** and **bulk send** — now honestly advertised as unavailable; still to build.
- **`hasFeature()` is never called** — no feature gating exists at all. Needed before PDF export can be tier-gated.

### Note

The seed account `jake@example.com` has been marked `emailVerified: true`, so
the demo login documented in `PERSONAL.md` now actually works — `auth.ts`
rejects unverified accounts regardless of password.

---

## 3c. Session two — 20 Aug 2026 (commits `e49db41`, `3ab56e6`)

Jake tested the live site and found two things. Both are fixed.

### The AI analysis was completely broken — and it wasn't anything Jake did

`src/lib/ai-analysis.ts` pinned `model: "claude-sonnet-4-20250514"`. **Anthropic
retired that model.** Confirmed directly against the live API with the project's
own key:

| Model | Result |
|---|---|
| `claude-sonnet-4-20250514` | **404** `not_found_error` |
| `claude-opus-5` | 200 |
| `claude-sonnet-5` | 200 |

The key is valid and has credit. It went unnoticed because `analyze/route.ts`
only recognised 529/overloaded errors, so a 404 collapsed into the generic
"Failed to analyze issue".

**Nobody but Jake was affected.** Last successful analysis was 29 May; no user
created an issue between then and now.

Now on the official `@anthropic-ai/sdk` with **`claude-opus-5`**:

- Undated model alias — this can't be retired from under the app again.
- Reads text by **narrowing content blocks on type**. Thinking is on by default
  for this model, so `content[0]` is a thinking block with no `text` field —
  changing only the model string would have turned the 404 into "Empty response
  from AI".
- **Streams with `max_tokens: 32000`.** 4096 truncated the JSON immediately;
  16000 still truncated mid-array once thinking was counted. Caught by an
  explicit `stop_reason: "max_tokens"` warning rather than guesswork.
- Server-side **refusal fallback** — complaints describe police conduct and
  harassment, so a safety refusal is a live risk. `AnalysisRefusedError` surfaces
  it as a 422 the user can act on.
- **Typed SDK errors**, most specific first. A `NotFoundError` now logs "the
  configured model may have been retired" by name — the next retirement will be
  obvious in seconds instead of months.
- Quality is markedly better than the retired model: a test stop-and-search
  complaint cited PACE 1984 and Police Reform Act 2002 Schedule 3, with the
  correct South Wales Police PSD address and email.

**Cost:** roughly 8-10p per complaint generated.

### Notifications are real now

The bell was a `<button>` with no click handler and a **hardcoded "3"** beside
it. Replaced with a real `Notification` model, three API routes, a
`/notifications` page, and emission from events that already existed — complaint
sent, complaint opened, reply received. The reply hook matters most: that's the
moment a user most wants to hear from us.

### Users can reach support

New `SupportMessage` model and a contact form on `/help`, replacing the passive
mailto. Stores first, emails second — email can fail, the record must not be
lost; `emailedAt` stays null when delivery failed so unsent messages are
findable. Captures the user's tier at the time of writing. Plus a welcome email
on verification, and Help promoted into the main nav.

### On the user with three accounts

Not a bug and not Jake's fault. All three accounts (ids 18, 19, 20) show **zero
failed logins**. The pattern is: hit the 3-send free cap, register again. Sends
were 3, 3, 2; 25 complaints generated across the three. Free-tier evasion — and
a sign the product was worth the hassle to him. If it becomes common, the lever
is requiring email verification before the first send.

---

## 3d. AI cost and the timeout problem — measured 20 Aug 2026

Jake topped the Anthropic account up to $23 after it ran dry. Before deciding
how to spend it, one real issue (a stop-and-search complaint) was run through
the app's own prompt on every sensible configuration.

| Model | Effort | Cost | Time | Letter | Violations / Legislation / Precedents |
|---|---|---|---|---|---|
| claude-opus-5 | high *(was the default)* | **$0.51** | **239s** | 11,727 | 8 / 8 / 6 |
| claude-opus-5 | medium | $0.38 | 171s | 10,905 | 7 / 8 / 6 |
| claude-opus-5 | low | $0.31 | 139s | 9,221 | 7 / 7 / 6 |
| claude-sonnet-5 | medium | $0.11 | 64s | 3,761 | 5 / 4 / 3 |
| claude-sonnet-5 | low | $0.08 | 46s | 3,170 | 4 / 4 / 3 |

**Two conclusions, both important.**

**1. Cost was badly underestimated.** Earlier figures of "8-10p per complaint"
were wrong — the real number at the shipped default was **40p**. The retired
Sonnet 4 model cost roughly 4p and produced ~3,600-character letters, which is
why heavy use previously cost almost nothing. Opus 5 produces 3× the output at
5× the token price.

**2. Every Opus configuration exceeds a serverless request timeout.** At 139-239
seconds, no synchronous HTTP request survives — Vercel's Hobby ceiling is 60s
and Pro's default is 300s. This is the real cause of "stuck on Analysing your
issue", independent of the credit problem. Only Sonnet 5 at low effort (46s)
fits inside 60s, and not with much margin.

**The architectural answer is that analysis should not be answered inside the
HTTP request at all** — it should be queued, with the page polling for
completion. That also fixes the user experience, since nobody should watch a
spinner for three minutes.

### Changes made off the back of this

- `ANALYSIS_MODEL` and `ANALYSIS_EFFORT` are now environment variables, so the
  cost/quality trade-off can be tuned without a code change. Default effort
  lowered from `high` to `medium`.
- Every analysis now logs `[analysis-usage] model=… in=… out=… thinking=… cost=$…`.
  The account ran to zero unnoticed because nothing recorded what was being
  spent.
- The server-side refusal fallback is now conditional on the model family —
  Sonnet 5 rejects it with a 400, so switching model would previously have
  broken analysis outright.

### Unit economics at 40p vs 8p per complaint

| Tier | Price | Included | Cost @ Opus 5 | Cost @ Sonnet 5 |
|---|---|---|---|---|
| Free | £0 | 3 lifetime | ~£1.20 given away | ~£0.25 |
| Basic | £4.99 | 5/month | ~£1.50 | ~£0.32 |
| Pro | £14.99 | 15/month | ~£4.50 | ~£0.96 |
| Agency | £19.99 | 30/month | ~£9.00 | ~£1.92 |

**Follow-ups are the unpriced risk.** Each one is another full generation, and
the limits are 10 per complaint on Basic, 20 on Pro, 50 on Agency. A Basic user
who used the lot would generate 55 analyses — around £22 of cost against £4.99
of revenue. Nothing currently prevents this.

---

## 3e. Planned: single operations dashboard (not yet built)

Jake's request, to be built once the site is more polished. One page showing
everything that currently requires logging into five different services:

- **Anthropic** — credit balance remaining, spend per day, cost per complaint,
  and a warning before it runs dry (it going to zero silently killed analysis
  for everyone on 20 Aug).
- **Resend** — emails sent, delivered, bounced, monthly quota used, domain and
  webhook health.
- **Stripe** — active subscribers by tier, MRR, failed payments, churn.
- **Platform** — users, issues, complaints sent/opened/replied, response rates
  by organisation, S3 storage used.
- **Health** — which integrations are actually configured and working, so a
  missing key is visible rather than discovered by a user hitting an error.

Ideally with the ability to act on it in place — top up credit, retry a failed
payment — rather than only observing. Builds naturally on top of the admin
panel already in the backlog, since both need the same `role`-gated area.

---

## 4. Next up

Roughly in priority order.

1. **Verify the Resend webhook is configured** (§2.1). The code fix is worthless if no webhook points at the endpoint. Then send one complaint end to end and confirm `openedAt` populates.
2. **Re-engage the 29 existing users.** Nobody has signed up since 11 June. 41 complaints sit in draft — people started and didn't finish. Worth understanding why before building anything new.
3. **Admin panel** — the thing Jake originally went looking for. Read-only first: users, issues, complaints sent, replies received, subscription status.
4. **Svix verification on both webhooks** — currently anyone who sends the three header names can post fake events.
5. **S3 keys** so evidence upload works (0 evidence items to date).
6. **HTML complaint template** — plain-text complaints to ombudsmen and police PSDs look less credible than they should.
7. **Legal position** — still outstanding from the launch plan: solicitor opinion (~£300) and PI insurance (~£300-600/yr). Real users are sending real complaints to real regulators on the platform today.

---

## 5. Quick reference

```bash
npm run dev        # localhost:3001
npm run build      # prisma generate + next build
npm run db:studio  # browse the live Railway DB — use this instead of an admin panel for now
npm run db:push
```

- **Live:** civicshield.co.uk (Vercel) · **DB:** Railway PostgreSQL
- **Repo:** `JSAUTOAI/CivicShield`, branch `main`
- **Login:** `psacc515@gmail.com` — password reset 20 Aug 2026, change it in `/settings`
