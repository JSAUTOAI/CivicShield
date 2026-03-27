# CivicShield v2 — Build Skills & Tools Reference

Reference document for Claude Code skills, tools, and patterns used to build this project professionally.

---

## Claude Code Skills (Slash Commands)

| Skill | Purpose | When to Use |
|---|---|---|
| `/commit` | Structured git commits with conventional format | After completing a feature or fix |
| `/review-pr` | Code review on pull requests | Before merging any PR |
| `/simplify` | Review changed code for reuse, quality, efficiency | After writing new code — catches overengineering |
| `/claude-api` | Claude API / Anthropic SDK integration patterns | When building or modifying AI analysis features |
| `/update-config` | Configure Claude Code settings, hooks, permissions | When setting up automated behaviours or permissions |

---

## Key Integration Patterns

### Stripe Subscriptions (Next.js App Router)
- Server-side: `stripe` package in API routes only (`src/lib/stripe.ts`)
- Client-side: `@stripe/stripe-js` for Checkout redirect
- Webhook: `src/app/api/stripe/webhook/route.ts` — verify signature, update user tier
- Portal: Stripe Customer Portal for self-service subscription management
- Pattern: Create Checkout Session → redirect → webhook confirms → update DB

### Resend Email (Complaint Delivery)
- Server-side only: `resend` package in API routes (`src/lib/email.ts`)
- Templates: HTML email templates in `src/lib/email-templates.ts`
- Tracking: Resend webhooks for delivery/open/bounce status
- Pattern: User sends complaint → API calls Resend → webhook updates complaint status

### Prisma 6 (Database)
- Schema: `prisma/schema.prisma` — 22 tables with `@@map()` for snake_case
- Client: `src/lib/db.ts` — singleton pattern for connection pooling
- Commands: `npm run db:push` (schema sync), `npm run db:seed` (demo data), `npm run db:studio` (GUI)
- Pattern: Never call Prisma from components — always via API routes in `/app/api/`

### NextAuth v5 (Authentication)
- Config: `src/lib/auth.ts` — Credentials provider, JWT sessions
- Session: Access via `auth()` server-side, `useSession()` client-side
- Middleware: `src/middleware.ts` — protects dashboard + API routes
- Pattern: JWT callback adds `subscriptionTier` to token → available in all pages without extra DB query

### Claude API (AI Legal Analysis)
- Config: `src/lib/ai-analysis.ts` — system prompt + structured JSON output
- Mock fallback: Returns demo analysis when `ANTHROPIC_API_KEY` is not set
- Pattern: Issue created → `/api/issues/[id]/analyze` → Claude API → structured JSON → stored in `legalAnalysis` table → auto-generates complaint draft

---

## API Response Standard

All API routes MUST return:
```json
{
  "success": true | false,
  "data": { ... } | null,
  "error": "message" | null
}
```

Helpers in `src/lib/api-response.ts`:
- `apiSuccess(data)` — wraps data in success response
- `apiError(message, status)` — wraps error message with HTTP status

---

## Tier Enforcement Pattern

```
src/lib/tiers.ts:
  - TIER_LIMITS — defines complaint limits, feature access per tier
  - getUserTier(userId) — queries DB for current subscription
  - checkComplaintLimit(userId) — counts this month's complaints vs limit
  - canUseFeature(userId, feature) — boolean gate for specific features
```

Used in API routes before processing mutations. Never enforced client-side only.

---

## File Organisation Rules

| Type | Location | Example |
|---|---|---|
| Business logic | `src/lib/` | `stripe.ts`, `tiers.ts`, `email.ts` |
| API endpoints | `src/app/api/` | `stripe/checkout/route.ts` |
| UI components | `src/components/ui/` | `upgrade-prompt.tsx` |
| Layout components | `src/components/layout/` | `navbar.tsx` |
| Pages | `src/app/(dashboard)/` | `issues/page.tsx` |
| Validation schemas | `src/lib/validations.ts` | Zod schemas |
| Constants | `src/lib/constants.ts` | Categories, statuses, nav items |

---

## Deployment Stack

| Service | Purpose | Config |
|---|---|---|
| Vercel | App hosting (Next.js) | Connect GitHub repo, set env vars |
| Railway | PostgreSQL database | `DATABASE_URL` connection string |
| Stripe | Payment processing | Test mode for dev, live for prod |
| Resend | Email delivery | Verify `civicshield.co.uk` domain |
| Anthropic | AI analysis (Claude API) | `ANTHROPIC_API_KEY` |

---

## Dev Workflow

1. Make changes locally on `localhost:3001`
2. Use `/simplify` to review code quality
3. Use `/commit` for structured commits
4. Push to GitHub → Vercel auto-deploys
5. Test in production
6. Update `CLAUDE.md` with any new files/patterns
