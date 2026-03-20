# CivicShield v2

AI-powered UK civic rights platform. Helps citizens log issues, get AI legal analysis, generate solicitor-grade complaints, track responses, and hold organisations accountable.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (CSS-based config in `globals.css`, NOT `tailwind.config.ts`)
- **Database:** PostgreSQL via Prisma 6 ORM
- **Auth:** NextAuth v5 (Credentials provider, JWT sessions)
- **AI:** Claude API (Anthropic) for legal analysis
- **UI Components:** Custom shadcn-inspired components in `src/components/ui/`
- **Icons:** Lucide React
- **Toasts:** Sonner
- **Validation:** Zod

## Project Structure

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
│       ├── issues/      # CRUD + analyze + complaint generation
│       ├── complaints/  # CRUD + send
│       └── resources/   # List/search
├── components/
│   ├── layout/          # Navbar, mobile nav, logo, theme provider, session provider
│   └── ui/              # Button, Card, Badge, Input, Textarea, Select, Progress, Avatar
├── lib/
│   ├── auth.ts          # NextAuth config with Credentials provider
│   ├── db.ts            # Prisma client singleton
│   ├── ai-analysis.ts   # Claude API integration + mock fallback
│   ├── constants.ts     # Issue categories, sub-types, statuses, nav items
│   ├── validations.ts   # Zod schemas for all inputs
│   ├── hooks.ts         # useFetch, useSession helpers
│   └── utils.ts         # cn(), formatDate, getInitials
└── middleware.ts         # Auth protection (redirects to /login)
```

## Key Patterns

- **Route groups:** `(auth)`, `(dashboard)`, `(public)` for different layouts
- **All pages are client components** (`"use client"`) — server components used for layouts only
- **API routes** handle all data mutations — pages fetch via `fetch()` calls
- **Mock data** is used in page components for display when DB isn't connected
- **AI analysis** falls back to structured mock response when `ANTHROPIC_API_KEY` is not set
- **Prisma schema** maps all 22 tables from the original PostgreSQL dump with `@@map()` for snake_case table names

## Database

- **22 tables** across 6 domains: Users/Auth, Issues, Legal Cases, Community, Resources
- Schema in `prisma/schema.prisma`
- Seed script in `prisma/seed.ts` (demo user, permissions, resources, submission targets, demo issues)
- Commands: `npm run db:push`, `npm run db:seed`, `npm run db:studio`

## Issue Categories & Sub-Types

5 categories with ~22 sub-types defined in `src/lib/constants.ts`:
- Public Sector & Government (Police, Council, School Board, Bailiff, Solicitor)
- Business & Commerce (Utilities, Telecom, Banks, Insurance, Delivery, Suppliers, Clients, Private Companies)
- Employment & Workplace (Employers, Agencies, Trade Unions)
- Legal & Justice (Probation, Prisons, Barristers, Professional Bodies)
- Personal / Individual (Neighbour Disputes, Harassment, Other)

## Design System

- Brand color: `--color-brand-500: #4f6ef7` (professional blue/indigo)
- Dark mode via `.dark` class toggle (stored in localStorage)
- CSS custom properties in `globals.css` under `@theme inline`
- Animations: `animate-fade-in`, `stagger-fade-in`, `animate-scale-in`, `card-hover`, `glass`, `gradient-text`, `skeleton`
- All components use `cn()` utility from `src/lib/utils.ts`

## Environment Variables

All in `.env` (never committed):
- `DATABASE_URL` — Railway PostgreSQL connection string (REQUIRED)
- `NEXTAUTH_URL` — App URL, `http://localhost:3001` for dev (REQUIRED)
- `NEXTAUTH_SECRET` — Random secret for JWT signing (REQUIRED)
- `ANTHROPIC_API_KEY` — Claude API key for real AI analysis (optional, mock works without)
- `SMTP_*` — Email sending for complaints (optional)
- `STRIPE_*` — Subscription billing (optional)

## Dev Commands

```bash
npm run dev          # Start on port 3001
npm run build        # Production build (runs prisma generate first)
npm run db:push      # Push schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## Domain

- **URL:** civicshield.co.uk
- **Hosting plan:** Vercel (app) + Railway (PostgreSQL)

## Important Notes

- Port 3001 (not 3000 — Jake has another project on 3000)
- UK-focused: all legal analysis, legislation, and case law is UK-specific
- The AI analysis engine in `src/lib/ai-analysis.ts` uses a detailed system prompt that instructs Claude to reference real UK case law and generate structured JSON
- Demo login after seeding: `jake@example.com` / `CivicShield2024!`
- The original Replit app's SQL dump is at `../less full_dump.sql.md` for reference
