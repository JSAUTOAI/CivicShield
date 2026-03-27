# CivicShield v2 — System Specification (Claude Controlled Build)

AI-powered UK civic rights platform that allows users to log issues, receive structured AI legal analysis, generate formal complaints, and track responses from organisations.

This file defines STRICT rules for how the system must be built, extended, and maintained.

---

# 1. CORE PRODUCT DEFINITION

CivicShield is:

- A structured complaint automation platform
- A legal process assistant (NOT a legal advisor)
- A case tracking and escalation system
- A tool for holding institutions accountable

CivicShield is NOT:

- A solicitor replacement
- A legal advice provider
- A general AI chatbot
- A social media platform

---

# 2. EXISTING SYSTEM CONTEXT (DO NOT BREAK)

The system is already built and running using:

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (CSS-based config in `globals.css`, NOT `tailwind.config.ts`)
- **Database:** PostgreSQL via Prisma 6 ORM
- **Auth:** NextAuth v5 (Credentials provider, JWT sessions)
- **AI:** Claude API (Anthropic) for legal analysis
- **UI Components:** Custom shadcn-inspired components in `src/components/ui/`
- **Icons:** Lucide React
- **Toasts:** Sonner
- **Validation:** Zod

Claude MUST:
- Work WITH the existing structure
- NOT rebuild working systems
- NOT change stack unless explicitly told

---

# 3. PROJECT STRUCTURE (ENFORCED)

```
src/
├── app/
│   ├── (auth)/          # Login, register (public, split-screen layout)
│   ├── (dashboard)/     # All authenticated pages (navbar + mobile nav)
│   │   ├── issues/      # List, create wizard, detail/analysis
│   │   ├── complaints/  # All/Drafts/Sent management
│   │   ├── resources/   # Legal resources library
│   │   ├── petitions/   # Trending petitions
│   │   ├── settings/    # Profile, security, preferences, subscription
│   │   └── page.tsx     # Home dashboard
│   ├── (public)/        # Landing page (unauthenticated)
│   └── api/             # API routes
│       ├── auth/        # NextAuth + registration
│       ├── issues/      # CRUD + [id] GET + analyze + complaint generation
│       ├── complaints/  # CRUD + send
│       ├── resources/   # List/search
│       ├── settings/    # Profile PATCH + password PATCH
│       └── stripe/      # Checkout, portal, webhook (Phase 2)
├── components/
│   ├── layout/          # Navbar, mobile nav, logo, theme provider, session provider
│   └── ui/              # Button, Card, Badge, Input, Textarea, Select, Progress, Avatar, LoadingSkeleton, EmptyState, UpgradePrompt
├── lib/
│   ├── auth.ts          # NextAuth config with Credentials provider
│   ├── db.ts            # Prisma client singleton
│   ├── ai-analysis.ts   # Claude API integration + mock fallback
│   ├── api-response.ts  # Standardised { success, data, error } response helpers
│   ├── types.ts         # Shared TypeScript interfaces for API responses
│   ├── constants.ts     # Issue categories, sub-types, statuses, nav items
│   ├── validations.ts   # Zod schemas for all inputs
│   ├── hooks.ts         # useFetch, useSession helpers
│   └── utils.ts         # cn(), formatDate, getInitials
└── middleware.ts         # Auth protection (redirects to /login)
```

Rules:
- Business logic → `/lib/`
- API logic → `/app/api/`
- UI components → `/components/`
- NO business logic inside React components
- NO database calls inside UI components

---

# 4. CORE SYSTEM FLOW (DO NOT CHANGE)

ALL development must support this pipeline:

1. Issue Creation
2. AI Legal Structuring
3. Complaint Generation
4. Routing (targets)
5. User Edit / Send
6. Tracking & Follow-ups

Do NOT introduce features that bypass this flow.

---

# 5. DATABASE RULES (CRITICAL)

- **22 tables** across 6 domains: Users/Auth, Issues, Legal Cases, Community, Resources
- Schema in `prisma/schema.prisma`
- Seed script in `prisma/seed.ts` (demo user, permissions, resources, submission targets, demo issues)
- Existing schema is based on full SQL dump → DO NOT BREAK
- Prisma uses `@@map()` → preserve all mappings

NEVER:
- Drop tables
- Rename columns destructively
- Change relationships without migration logic

ONLY:
- Extend safely
- Add new tables if required
- Maintain backward compatibility

Commands: `npm run db:push`, `npm run db:seed`, `npm run db:studio`

---

# 6. API ARCHITECTURE

- All mutations go through `/api/`
- No direct DB calls from frontend
- REST-style structure

Routes:
- `/api/issues` (GET list, POST create)
- `/api/issues/[id]` (GET single with relations)
- `/api/issues/[id]/analyze` (POST run AI analysis + auto-generate complaint)
- `/api/issues/[id]/complaint` (POST regenerate complaint)
- `/api/complaints` (GET list)
- `/api/complaints/[id]` (GET, PATCH update/send, DELETE)
- `/api/auth/` (NextAuth + registration)
- `/api/resources/` (GET list/search)
- `/api/settings/profile` (GET, PATCH)
- `/api/settings/password` (PATCH)
- `/api/stripe/checkout` (POST — Phase 2)
- `/api/stripe/portal` (POST — Phase 2)
- `/api/stripe/webhook` (POST — Phase 2)

All responses must follow:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

# 7. AI SYSTEM (STRICT CONTROL)

## 7.1 AI PURPOSE

AI is ONLY used for:

1. Structuring user input
2. Generating complaints
3. (Future) generating follow-ups

The AI analysis engine in `src/lib/ai-analysis.ts` uses a detailed system prompt that instructs Claude to reference real UK case law and generate structured JSON. Falls back to mock response when `ANTHROPIC_API_KEY` is not set.

## 7.2 AI OUTPUT FORMAT (MANDATORY)

AI MUST return structured JSON only.

Example:

```json
{
  "summary": "",
  "key_facts": [],
  "potential_issues": [],
  "relevant_frameworks": [],
  "suggested_actions": []
}
```

NEVER:
- Return markdown
- Return essays
- Return conversational output

## 7.3 AI BEHAVIOUR RULES

- UK-specific only
- No legal advice claims
- No definitive conclusions
- Neutral, structured tone

---

# 8. FEATURE CONTROL (VERY IMPORTANT)

Claude MUST NOT overbuild.

**Phase 1 (COMPLETE):**
- Issue submission ✅
- AI analysis ✅
- Complaint generation ✅
- Draft saving ✅
- All pages wired to real APIs ✅
- Settings backend (profile + password) ✅
- SessionProvider enabled ✅
- Loading/empty/error states ✅

**Phase 2 (CURRENT FOCUS):**
- Stripe subscription integration (£4.99/mo Pro, £14.99/mo Agency)
- Tier enforcement (3 free complaints, gated auto-send)
- Email sending via Resend
- Multi-recipient CC
- Complaint tracking

**Phase 3:**
- Follow-ups
- Escalations
- Authority pressure logic

**Phase 4 (DO NOT BUILD YET):**
- Public case sharing
- Petitions expansion
- Collective action systems

---

# 9. FILE CREATION RULES

Claude MUST:
- Create small, modular files
- Use clear naming
- Avoid large multi-purpose files

Examples: `ai-analysis.ts`, `complaint-generator.ts`, `routing-engine.ts`

---

# 10. EDITING RULES

Claude MUST:
- NOT overwrite large files unnecessarily
- NOT remove working code
- ONLY modify relevant sections
- Preserve all existing functionality

---

# 11. UI / UX RULES

- Clean, minimal, professional
- No clutter
- No excessive animations

Tone: Legal-tech, Government-grade, Trustworthy

Design System:
- Brand color: `--color-brand-500: #4f6ef7` (professional blue/indigo)
- Dark mode via `.dark` class toggle (stored in localStorage)
- CSS custom properties in `globals.css` under `@theme inline`
- Animations: `animate-fade-in`, `stagger-fade-in`, `animate-scale-in`, `card-hover`, `glass`, `gradient-text`, `skeleton`
- All components use `cn()` utility from `src/lib/utils.ts`

---

# 12. SECURITY RULES

- Validate ALL input (Zod)
- Never trust frontend
- Protect routes via middleware
- Sanitize all user input

---

# 13. PERFORMANCE RULES

- Avoid unnecessary API calls
- Optimise database queries
- Keep components lightweight

---

# 14. KEY PATTERNS

- **Route groups:** `(auth)`, `(dashboard)`, `(public)` for different layouts
- **All pages are client components** (`"use client"`) — server components used for layouts only
- **Dashboard layout** uses `dynamic = "force-dynamic"` to prevent static prerendering
- **SessionProvider** wraps the app in root layout — `useSession()` available everywhere
- **API routes** handle all data mutations — pages fetch via `useFetch()` hook
- **All pages fetch from real APIs** — no mock/hardcoded data in dashboard pages
- **Prisma schema** maps all 22 tables from the original PostgreSQL dump with `@@map()` for snake_case table names

Issue Categories & Sub-Types (5 categories, ~22 sub-types in `src/lib/constants.ts`):
- Public Sector & Government (Police, Council, School Board, Bailiff, Solicitor)
- Business & Commerce (Utilities, Telecom, Banks, Insurance, Delivery, Suppliers, Clients, Private Companies)
- Employment & Workplace (Employers, Agencies, Trade Unions)
- Legal & Justice (Probation, Prisons, Barristers, Professional Bodies)
- Personal / Individual (Neighbour Disputes, Harassment, Other)

---

# 15. ENVIRONMENT VARIABLES

All in `.env` (never committed):

Required:
- `DATABASE_URL` — Railway PostgreSQL connection string
- `NEXTAUTH_URL` — App URL, `http://localhost:3001` for dev
- `NEXTAUTH_SECRET` — Random secret for JWT signing

Optional:
- `ANTHROPIC_API_KEY` — Claude API key for real AI analysis (mock works without)
- `SMTP_*` — Email sending for complaints
- `STRIPE_*` — Subscription billing

---

# 16. DEV COMMANDS

```bash
npm run dev          # Start on port 3001
npm run build        # Production build (runs prisma generate first)
npm run db:push      # Push schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

---

# 17. DEPLOYMENT

- **URL:** civicshield.co.uk
- **Hosting:** Vercel (app) + Railway (PostgreSQL)
- **Dev port:** 3001 (not 3000 — Jake has another project on 3000)
- **Demo login after seeding:** `jake@example.com` / `CivicShield2024!`
- **Original SQL dump:** `../less full_dump.sql.md` for reference

---

# 18. DEVELOPMENT RULE

Claude must behave like:
- Senior engineer
- System architect

NOT:
- Prototype builder
- Feature spammer

---

# 19. FINAL INSTRUCTION

If ANY uncertainty exists:

STOP
ASK FOR CLARIFICATION

DO NOT GUESS
DO NOT ASSUME
DO NOT OVERBUILD

---

# 20. ALIGNMENT TASK (IMPORTANT)

When this file is updated, Claude should:

1. Review current codebase
2. Identify misalignment with this spec
3. Suggest minimal changes (NOT full rewrites)
4. Maintain stability
