# CivicShield — Working Document (README2)

**Started:** 19 August 2026
**Supersedes:** nothing. `README.md`, `CLAUDE.md` (build rules), and `PERSONAL.md` (rebuild/backup reference) all stay as they are. This file is the running log of state and next actions from today forward.

---

## 1. Where things stood on 19 Aug 2026

Last commit before today: `edd47bb`, **26 April 2026**. Roughly four months idle.

The site stayed live on Vercel the whole time and kept taking real signups. Nothing had rotted — `npm run build` passed clean on the first attempt with the current toolchain (Node 24, Next 16, Prisma 6).

### Live production numbers (read from Railway, 19 Aug 2026)

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

Both had `emailVerified: false`, which [src/lib/auth.ts:90-92](src/lib/auth.ts#L90-L92) treats as a hard block on sign-in — so neither could log in regardless of password. Fixed for id 6 on 19 Aug.

---

## 2. What was fixed on 19 Aug 2026

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
| Admin panel | Deliberately deferred 19 Aug. `role` column and `RolePermission` table already exist to build on. Use `npm run db:studio` to read data meanwhile. |
| Create-petition UI | Button is disabled. `POST /api/petitions` already works. |
| In-app notifications | No `Notification` model in the schema yet. |
| HTML complaint email | Complaints send as plain text. Verification and reset emails are HTML. |
| Svix signature verification | Both webhooks check that svix headers are *present*, not that they're *valid*. |
| S3 evidence upload | Code complete in [src/lib/s3.ts](src/lib/s3.ts) + `/api/upload`. `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` are **empty** in `.env`. See `S3-SETUP-GUIDE.md`. |
| PDF export · follow-up generation · public accountability dashboard | Phase 3/4. |

### Housekeeping noticed, not actioned
- Four empty directories: `src/components/{complaints,forms,issues,resources}`.
- `.env` has a stray `whsec_...` value on the last line, outside any variable assignment. Harmless (shell/dotenv ignores it) but should be identified or removed.
- `PERSONAL.md` §1 is stale: it lists the Stripe routes as unbuilt. All three have been implemented since. Corrected in that file on 19 Aug.

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
- **Login:** `psacc515@gmail.com` — password reset 19 Aug 2026, change it in `/settings`
