# CivicShield Premium UI Visual Redesign

## Context

The current UI has several visual quality issues that make it feel flat and unpolished for a legal-tech platform targeting a premium market:

1. **White-on-white**: Light mode background (`#ffffff`) and card (`#ffffff`) are identical — cards don't stand out from the page at all
2. **Shadows too subtle**: `shadow-xs` on cards is nearly invisible, providing no depth
3. **Text too harsh**: Foreground `#0f172a` is near-black, feels aggressive rather than professional
4. **Inconsistent spacing**: Section margins vary between `mb-6`, `mb-8`, `mb-10` across pages
5. **Hardcoded greys**: Loading skeletons and empty states bypass the theme system with hardcoded `bg-gray-200` etc.
6. **Form inputs blend into page**: Inputs use `bg-background` which will be the same off-white as the page after background change

This is a **visual-only** redesign — no functionality, data flow, or business logic changes.

---

## Phase 1: Foundation — globals.css Theme Tokens

**File:** `src/app/globals.css`

### Light Theme Token Changes (inside `@theme inline`)

| Token | Current | New | Why |
|---|---|---|---|
| `--color-background` | `#ffffff` | `#f8f9fb` | Off-white page bg so cards stand out |
| `--color-foreground` | `#0f172a` | `#1e293b` | Softer near-black, still WCAG AAA |
| `--color-card-foreground` | `#0f172a` | `#1e293b` | Match foreground |
| `--color-muted` | `#f8fafc` | `#f1f4f9` | Distinguishable from new background |
| `--color-muted-foreground` | `#64748b` | `#6b7280` | Warmer grey per design brief |
| `--color-border` | `#e2e8f0` | `#e5e7eb` | Slightly warmer, more visible |
| `--color-input` | `#e2e8f0` | `#e5e7eb` | Match border |
| `--color-secondary` | `#f1f5f9` | `#eef2f7` | More contrast |
| `--color-secondary-foreground` | `#0f172a` | `#1e293b` | Match foreground |
| `--color-accent` | `#f1f5f9` | `#eef2f7` | Match secondary |
| `--color-accent-foreground` | `#0f172a` | `#1e293b` | Match foreground |
| `--color-popover-foreground` | `#0f172a` | `#1e293b` | Match foreground |

**Keep unchanged:** `--color-card: #ffffff` (white cards on off-white bg = contrast), all brand colors, all semantic colors, all dark mode tokens.

### Shadow Token Changes

| Token | Current | New |
|---|---|---|
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.03)` | `0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)` |
| `--shadow-sm` | current | `0 2px 4px -1px rgb(0 0 0 / 0.08), 0 1px 3px -1px rgb(0 0 0 / 0.06)` |
| `--shadow-md` | current | `0 4px 8px -2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)` |
| `--shadow-lg` | current | `0 12px 20px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.05)` |

### Body Styles

Add `line-height: 1.6;` to the `body` rule for improved readability.

### Card Hover

Change `transform: translateY(-1px)` to `translateY(-2px)` for slightly more lift.

### New Tokens

```css
--color-gradient-start: #4f6ef7;
--color-gradient-end: #7c3aed;
--radius-2xl: 1.25rem;
```

---

## Phase 2: Base UI Components

### 2A. `src/components/ui/card.tsx`
- Card root: add `hover:shadow-sm` to base classes (subtle hover shadow on all cards)
- CardTitle: `font-semibold` → `font-bold`, `leading-none` → `leading-tight`

### 2B. `src/components/ui/button.tsx`
- Brand variant: `hover:shadow-md` → `hover:shadow-lg`
- Outline variant: `bg-background` → `bg-card`, add `hover:border-brand-200 dark:hover:border-brand-800`
- Size `lg`: `px-6` → `px-8`

### 2C. `src/components/ui/badge.tsx`
- Base: `font-medium` → `font-semibold`

### 2D. `src/components/ui/input.tsx`
- `h-10` → `h-11`, `bg-background` → `bg-card`, `px-3` → `px-3.5`
- Add `hover:border-brand-300 dark:hover:border-brand-700`

### 2E. `src/components/ui/textarea.tsx`
- `bg-background` → `bg-card`, `px-3` → `px-3.5`
- Add `hover:border-brand-300 dark:hover:border-brand-700`

### 2F. `src/components/ui/select.tsx`
- `h-10` → `h-11`, `bg-background` → `bg-card`, `px-3` → `px-3.5`

### 2G. `src/components/ui/empty-state.tsx`
- Replace hardcoded greys with semantic tokens: `bg-gray-100 dark:bg-gray-800` → `bg-muted`, `text-gray-900 dark:text-white` → `text-foreground`, `text-gray-500 dark:text-gray-400` → `text-muted-foreground`

### 2H. `src/components/ui/loading-skeleton.tsx`
- Replace hardcoded greys: `bg-gray-200 dark:bg-gray-700` → `bg-muted`, `border-gray-200...dark:border-gray-700` → `border-border`, `bg-white...dark:bg-gray-800` → `bg-card`

---

## Phase 3: Layout Components

### 3A. `src/components/layout/navbar.tsx`
- Header: `bg-background/80` → `bg-card/80` (white navbar on off-white page)

### 3B. `src/components/layout/mobile-nav.tsx`
- Nav container: `bg-background/95` → `bg-card/95` (white mobile nav)

---

## Phase 4: Page Spacing Standardisation

**Standard rules across all dashboard pages:**
- Page wrapper: `py-8` → `py-10`
- Section bottom margin: standardise to `mb-12`
- Section heading margin: `mb-4` → `mb-6`
- Section titles (`h2`): `font-semibold` → `font-bold`

### Pages to update:
| File | Changes |
|---|---|
| `src/app/(dashboard)/page.tsx` | `py-8`→`py-10`, `mb-8`→`mb-12`, `mb-10`→`mb-12`, `mb-4`→`mb-6`, headings `font-semibold`→`font-bold` |
| `src/app/(dashboard)/issues/page.tsx` | `py-8`→`py-10`, `mb-6`→`mb-8` |
| `src/app/(dashboard)/issues/[id]/page.tsx` | `py-8`→`py-10` only (do NOT touch text colors — recent contrast fixes) |
| `src/app/(dashboard)/issues/new/page.tsx` | `py-8`→`py-10` |
| `src/app/(dashboard)/complaints/page.tsx` | `py-8`→`py-10`, `mb-6`→`mb-8` |
| `src/app/(dashboard)/resources/page.tsx` | `py-8`→`py-10`, headings `font-semibold`→`font-bold` |
| `src/app/(dashboard)/petitions/page.tsx` | `py-8`→`py-10`, headings `font-semibold`→`font-bold` |
| `src/app/(dashboard)/settings/page.tsx` | `py-8`→`py-10` |

**No changes needed:** Auth pages (login/register), auth layout, public landing page — these already have appropriate spacing or will auto-benefit from component changes.

---

## Execution Order

1. `globals.css` — foundation tokens (everything depends on this)
2. `loading-skeleton.tsx`, `empty-state.tsx` — semantic token migration
3. `card.tsx` — shadow + title weight
4. `button.tsx` — hover states + outline variant
5. `input.tsx`, `textarea.tsx`, `select.tsx` — form field consistency
6. `badge.tsx` — font weight
7. `navbar.tsx`, `mobile-nav.tsx` — bg-card chrome
8. All dashboard pages — spacing standardisation

---

## Verification

After implementation, check:
- [ ] Light mode: white cards visibly stand out on off-white `#f8f9fb` background
- [ ] Light mode: text is `#1e293b` (softer, not harsh black)
- [ ] Light mode: inputs/selects are white, elevated from page background
- [ ] Light mode: navbar + mobile nav appear white, distinct from page
- [ ] Dark mode: toggle between modes — no regressions on any page
- [ ] Dark mode: issue detail page (`/issues/[id]`) contrast fixes preserved
- [ ] Shadows: cards have visible subtle depth at rest, deeper on hover
- [ ] Hover states: cards lift 2px on hover, brand buttons get shadow-lg
- [ ] Spacing: all dashboard pages have consistent `py-10` and `mb-12` sections
- [ ] Forms: all inputs are `h-11` (44px) with white backgrounds
- [ ] Build: `npm run build` passes with no errors
