# CivicShield — Personal Reference

Your offline-safe reference for the project. If Claude is unavailable, your PC dies, or you need to hand this to someone else — this document + the GitHub repo + your `.env` backup is enough to rebuild everything.

**Last updated:** 2026-04-18

---

## 1. What's built right now (snapshot)

Full system audit as of this file being written.

### Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-based config in `globals.css`)
- PostgreSQL via Prisma 6 ORM (hosted on Railway)
- NextAuth v5 (Credentials, JWT sessions, 30-day maxAge)
- Claude API for AI legal analysis (with mock fallback)
- Resend for outbound email
- Stripe for subscriptions (live keys configured)
- AWS S3 for evidence uploads (keys empty — pending setup)

### Feature completeness

**Working end-to-end:**
- User registration + login (email/password, bcryptjs, 5-attempt lockout)
- Email verification flow (token + resend endpoint)
- Issue creation wizard → AI analysis → complaint generation
- Complaint editing, truth-confirmation modal, real email send via Resend
- Inbound email reply webhook (updates complaint status to "responded")
- Resources library, legal dictionary, submission targets (all seeded)
- Petitions: list + sign endpoints hit the real DB; one-per-user enforced in code
- Settings: profile, password change, subscription view
- Light/dark mode with localStorage persistence

**Working but mock/hardcoded:**
- `/petitions` page itself — uses a hardcoded array (real GET endpoint exists at `/api/petitions`, just not wired)

**Stubbed / not yet built:**
- `/api/stripe/*` routes (checkout, portal, webhook) — Phase 2
- Resend open-tracking webhook (`openedAt` field exists, nothing writes to it)
- Svix signature verification on inbound webhook (header is checked but not validated)
- HTML email template (complaints go out as plain text)
- Create-petition UI ("Start a Petition" button is a stub)
- In-app notifications system
- Password reset endpoint (token infrastructure exists in schema)

### Database — 22 tables

| Domain | Tables |
|---|---|
| Users & Auth | User, PasswordHistory, Session, Permission, RolePermission, SecurityAuditLog, EncryptedData |
| Issues | Issue, Complaint, EvidenceItem, LegalAnalysis, AiChatMessage, IssueChangeHistory |
| Legal Cases | LegalCase, CourtDocument, CaseTimeline, CasePreparationTask, LegalPrecedent, RelevantLegislation, RightsViolation |
| Community | Petition, Signature, PublicUserProfile |
| Resources | Resource, DictionaryTerm, SubmissionTarget |

Schema source of truth: `prisma/schema.prisma`. Seed script: `prisma/seed.ts` (loads demo data + 100+ UK legal dictionary terms).

### Git / remote
- GitHub remote: `https://github.com/JSAUTOAI/CivicShield.git`
- Branch: `main` (tracking `origin/main`)
- `.gitignore` protects `.env`, `db_dump.md`, `CLAUDE.md.temp`

### Deployment targets (not yet live)
- App: Vercel (`civicshield.co.uk`)
- DB: Railway PostgreSQL
- Dev port: 3001 (not 3000 — 3000 is used by another project)

---

## 2. Backup strategy (do all of these)

### 2.1 The six things you need to rebuild

| # | Artefact | Where it lives | How to back up |
|---|---|---|---|
| 1 | Source code | GitHub `JSAUTOAI/CivicShield` | `git push` at end of each working day |
| 2 | Prisma schema | `prisma/schema.prisma` | In the git repo — pushed with everything else |
| 3 | Seed script | `prisma/seed.ts` | In the git repo |
| 4 | SQL dump | `civicshield/db_dump.md` (git-ignored) | **Not in git** — copy manually to an encrypted location |
| 5 | `.env` file | `civicshield/.env` | **Not in git** — encrypted password manager |
| 6 | Build rules | `CLAUDE.md` | In the git repo |

### 2.2 `.env` backup — do this today if not already done

Your `.env` contains **live Stripe keys, Resend API key, Anthropic API key, Railway DB URL, and NextAuth secret**. If you lose this file, you can regenerate some of it but you'd have to rotate the Stripe webhook secret and potentially lose access to Railway.

**Recommended:**
1. Open your password manager (Bitwarden is free — install from bitwarden.com if you don't have one)
2. Create a Secure Note called "CivicShield .env (master)"
3. Paste the full contents of `civicshield/.env`
4. Save. Done.

**Do NOT:**
- Email the file to yourself
- Put it in Google Drive / OneDrive / Dropbox in plaintext
- Commit it to GitHub (it's ignored, but double-check)
- Screenshot it

### 2.3 Database dump cadence

Weekly dump of the Railway Postgres:

```bash
# From anywhere on your machine (needs postgresql-client installed)
pg_dump "$DATABASE_URL" > backups/civicshield-$(date +%Y-%m-%d).sql
```

Where to put the dump:
- Keep the last 4 weeks locally (folder: `C:\Users\psacc\civicshield-backups\`)
- Copy the most recent to a USB stick or encrypted cloud folder monthly

### 2.4 Git push cadence

- End of every working day: `git status` → `git add -A` → `git commit -m "progress: ..."` → `git push`
- If anything in `prisma/schema.prisma` changed, include it in the commit — the schema is the single source of truth the next rebuild relies on

---

## 3. Full rebuild from zero (if your PC dies)

Assumes: new machine, nothing installed, GitHub access, your `.env` backup, and the last DB dump.

```bash
# 1. Prerequisites (install once)
# - Node.js 20+ from nodejs.org
# - Git from git-scm.com
# - PostgreSQL client (for pg_dump / psql)

# 2. Clone
git clone https://github.com/JSAUTOAI/CivicShield.git
cd CivicShield/civicshield

# 3. Install deps
npm install

# 4. Restore .env from your password manager
# (Paste contents into a new file named .env in this folder)

# 5. Point at the live Railway DB (already in .env) OR restore from a local dump:
#    If the live DB still works:
npm run db:push          # Ensure schema is in sync
#    If you're restoring from a dump into a fresh Postgres:
#    psql $DATABASE_URL < backups/civicshield-YYYY-MM-DD.sql

# 6. Seed demo data (safe to skip if restoring from dump)
npm run db:seed

# 7. Run
npm run dev              # Opens on http://localhost:3001
```

Demo login after seed: `jake@example.com` / `CivicShield2024!`

---

## 4. Support email — `support@civicshield.co.uk` (free path)

Google Workspace wants £16–22/mo. You don't need it. This setup uses Cloudflare (free, inbound) + Resend (already paid for, outbound) and gives you a working two-way support mailbox for £0/mo extra.

### 4.1 Inbound — Cloudflare Email Routing (free, ~5 minutes)

1. Log in to Cloudflare. If `civicshield.co.uk` isn't on Cloudflare yet, add it first (Add Site → follow nameserver change at your registrar).
2. In the `civicshield.co.uk` zone → sidebar → **Email** → **Email Routing**.
3. Click **Get started** / **Enable Email Routing**. Cloudflare will ask to add three MX records + one TXT (SPF) record — click "Add records automatically".
4. Under **Routing rules** → **Custom addresses** → **Create address**:
   - Custom address: `support`
   - Destination: `psacc515@gmail.com` (you'll get a one-time verification email on that Gmail)
5. Verify the Gmail destination by clicking the link in the verification email.

That's it for inbound. Anyone emailing `support@civicshield.co.uk` now lands in your Gmail.

### 4.2 Outbound — Gmail "Send mail as" using Resend SMTP

You want replies to **look like they come from `support@civicshield.co.uk`**, not from your personal Gmail.

1. In Gmail → ⚙️ (top right) → **See all settings** → **Accounts and Import**.
2. Under **Send mail as** → **Add another email address**.
3. Fill in:
   - Name: `CivicShield Support`
   - Email address: `support@civicshield.co.uk`
   - **LEAVE CHECKED** "Treat as an alias" — you own this address, so checked is correct. Unchecking causes a "via gmail.com" / "on behalf of" tag to appear in recipient inboxes.
   - Click **Next Step**
4. Next screen — SMTP credentials:
   - SMTP Server: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: your `RESEND_API_KEY` value from `.env` (starts with `re_`)
   - Secured connection: **SSL**
   - Click **Add Account**
5. Gmail sends a verification code to `support@civicshield.co.uk`. Since Cloudflare Routing is forwarding that address to your Gmail, the code arrives in your inbox. Paste it in to confirm.
6. Back on **Accounts and Import** → under **Send mail as:** → set **"When replying to a message:"** to **"Reply from the same address the message was sent to"**. Save changes.

Now when someone emails `support@civicshield.co.uk` and you reply, Gmail automatically sends from `CivicShield Support <support@civicshield.co.uk>`. No manual dropdown switching.

**Important — this only works in Gmail's web interface (mail.google.com).** Outlook, the Gmail mobile app, and other mail clients don't know about Gmail's custom send identities. If you reply in Outlook, it will send from your personal Gmail. To reply from the support address, use Gmail web. (Outlook can be configured separately if you want — ask Claude when needed.)

### 4.3 DNS records needed (summary)

Cloudflare Email Routing adds these automatically:
- 3 × MX records pointing at `route1.mx.cloudflare.net`, `route2...`, `route3...`
- 1 × TXT SPF record: `v=spf1 include:_spf.mx.cloudflare.net ~all`

**Watch out:** You probably already have an SPF record for Resend (for complaints@). Cloudflare's auto-add can clobber it. If both need to send, the SPF record should be:

```
v=spf1 include:amazonses.com include:_spf.mx.cloudflare.net ~all
```

(Resend's actual include may differ — check Resend dashboard → Domains → DNS records. The key rule: **only one SPF record per domain**, with all senders merged into it.)

For Resend outbound to still pass DMARC: confirm Resend's DKIM records (from Resend dashboard → Domains → `civicshield.co.uk` → DNS records) are in place. They should already be, since `complaints@` is sending successfully today.

### 4.4 Testing

1. From a different email (e.g. your personal Gmail, or ask a friend): send a message to `support@civicshield.co.uk`
2. Check `psacc515@gmail.com` — message should arrive within 30 seconds
3. Reply from Gmail, using the "From:" dropdown to select `support@civicshield.co.uk`
4. Check the test sender's inbox — the reply should show `support@civicshield.co.uk` as sender, no "via gmail.com" suffix. If it says "via", you missed step 4.4 "UNCHECK Treat as alias".

---

## 5. Useful commands cheat-sheet

```bash
# Dev
npm run dev              # Start dev server on :3001
npm run build            # Production build (runs prisma generate first)

# Database
npm run db:push          # Push schema changes to Railway
npm run db:seed          # Re-seed demo data
npm run db:studio        # Open Prisma Studio GUI

# Backup DB
pg_dump "$DATABASE_URL" > backups/civicshield-$(date +%Y-%m-%d).sql

# Git
git status
git add -A
git commit -m "message"
git push
```

---

## 6. Where things live (file map)

| Thing | Path |
|---|---|
| Pages | `src/app/(dashboard)/...` and `src/app/(auth)/...` |
| API routes | `src/app/api/...` |
| Business logic | `src/lib/` |
| DB schema | `prisma/schema.prisma` |
| Seed data | `prisma/seed.ts` |
| UI components | `src/components/ui/` |
| Layout (navbar, etc.) | `src/components/layout/` |
| Build rules / system spec | `CLAUDE.md` |
| Archived plans | `CLAUDE.md.plans/` |

---

## 7. When Claude is unavailable

You can still work on this without Claude. The spec in `CLAUDE.md` + this document + your memory of the last session is enough to hand this to:
- Another AI (ChatGPT, Gemini, Copilot)
- A human developer
- Yourself, solo

The project is not locked to any one assistant. Keep pushing to GitHub daily and you are safe.
