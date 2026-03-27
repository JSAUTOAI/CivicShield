# Legal Source Linking — Verified, Clickable References

## Context

Every legal reference on the legal analysis page and resources page is currently plain text — users can't verify sources or take action. This plan makes every case name, act title, and recommended action a clickable link to its verified authoritative source. This is also the foundation for CivicShield's broader vision: becoming the primary platform for managing IOPC, SRA, and Government Ombudsman complaints at scale.

**Scope of THIS plan:** Clickable verified source links across the legal analysis page + resources page.
**Future phases (NOT this plan):** Web search for case-building evidence, in-app complaint routing to IOPC/SRA/Ombudsman, DVSA/FOI integration.

---

## Step 1: Create Static Legal Source Registry

**New file: `src/lib/legal-sources.ts`**

Four registries + utility functions:

### 1A. UK Legislation Registry
Map act names → `legislation.gov.uk` URLs. Pattern: `/ukpga/YEAR/CHAPTER` for Acts, `/uksi/YEAR/NUMBER` for Statutory Instruments.

Key entries:
- Human Rights Act 1998 → `/ukpga/1998/42`
- Protection from Harassment Act 1997 → `/ukpga/1997/40`
- Equality Act 2010 → `/ukpga/2010/15`
- Freedom of Information Act 2000 → `/ukpga/2000/36`
- Data Protection Act 2018 → `/ukpga/2018/12`
- Police and Criminal Evidence Act 1984 → `/ukpga/1984/60`
- Consumer Rights Act 2015 → `/ukpga/2015/15`
- Tribunals, Courts and Enforcement Act 2007 → `/ukpga/2007/15`
- Criminal Justice Act 2003 → `/ukpga/2003/44`
- Courts Act 2003 → `/ukpga/2003/39`
- Taking Control of Goods Regulations 2013 → `/uksi/2013/1894`
- Civil Procedure Rules → `/uksi/1998/3132`
- ~25 total entries covering all acts referenced in the codebase + commonly encountered UK legislation

Export: `resolveActUrl(actTitle: string): string | null` — exact match, then fuzzy match (lowercase, strip "the" prefix).

### 1B. UK Case Law Registry
Map commonly cited cases → BAILII/National Archives URLs. Plus a URL construction function for neutral citations.

Export: `resolveCaseUrl(caseName: string, caseReference: string): string | null`
- Try static registry by case name
- If not found, parse neutral citation `[YEAR] COURT NUMBER` and construct:
  - `https://caselaw.nationalarchives.gov.uk/{court}/{year}/{number}` (primary)
  - Court mappings: UKHL, UKSC, EWHC, EWCA/Civ, EWCA/Crim

### 1C. Regulatory/Complaints Bodies Registry
Map authority types → complaints page URLs:

| Key | Body | Complaints URL |
|---|---|---|
| police | IOPC | policeconduct.gov.uk/complaints |
| solicitor | SRA | sra.org.uk/consumers/problems/ |
| council | Local Government Ombudsman | lgo.org.uk/make-a-complaint |
| data | ICO | ico.org.uk/make-a-complaint/ |
| dvsa | DVSA | gov.uk/government/organisations/dvsa |
| health | PHSO | ombudsman.org.uk/making-complaint |
| finance | Financial Ombudsman | financial-ombudsman.org.uk/consumers/how-to-complain |
| trading | Trading Standards | citizensadvice.org.uk/consumer/get-more-help/report-to-trading-standards/ |

Export: `resolveActionUrl(actionTitle: string): string | null` — keyword matching (contains "police" → IOPC, "solicitor" → SRA, etc.)

### 1D. Constitutional Documents Registry
Static map:
- Magna Carta → legislation.gov.uk/aep/Edw1cc1929/25/9
- Bill of Rights 1689 → legislation.gov.uk/aep/WilsandMar2/1/2
- ECHR → echr.coe.int/european-convention-on-human-rights
- UDHR → un.org/en/about-us/universal-declaration-of-human-rights

### 1E. Domain Whitelist + Validation
```typescript
const TRUSTED_DOMAINS = [
  "legislation.gov.uk", "bailii.org", "caselaw.nationalarchives.gov.uk",
  "gov.uk", "policeconduct.gov.uk", "sra.org.uk", "lgo.org.uk",
  "ico.org.uk", "ombudsman.org.uk", "financial-ombudsman.org.uk",
  "citizensadvice.org.uk", "echr.coe.int", "un.org"
]
export function isVerifiedUrl(url: string): boolean
```

### 1F. Master Resolution Function
```typescript
export function resolveSourceUrl(item: {
  type: "legislation" | "case" | "action" | "constitutional"
  title: string
  reference?: string
  aiGeneratedUrl?: string
}): string | null
```
Priority: static registry → AI-generated URL (if passes domain whitelist) → null.

---

## Step 2: Update AI Analysis Engine

**File: `src/lib/ai-analysis.ts`**

### 2A. Update Interfaces
- `LegislationResult`: add `url?: string`
- `RightsViolation`: add `legislationUrl?: string`
- `LegalPrecedentResult`: `caseUrl` already exists — ensure it's populated
- `RecommendedAction`: `actionUrl` already exists — ensure it's populated

### 2B. Update Claude System Prompt
Add to the IMPORTANT GUIDELINES section:
- Instruct Claude to generate `url` for each legislation item using `legislation.gov.uk/ukpga/YEAR/CHAPTER` pattern
- Instruct Claude to generate `caseUrl` for each precedent using `caselaw.nationalarchives.gov.uk/COURT/YEAR/NUMBER` pattern
- Instruct Claude to generate `actionUrl` for each recommended action linking to the relevant regulatory body
- Restrict to trusted domains only

### 2C. Add Post-Processing Enrichment
After parsing AI response, call `enrichWithVerifiedUrls()` which:
- Iterates legislation → resolves via registry, falls back to AI URL if verified
- Iterates precedents → resolves via registry + citation parser, falls back to AI URL
- Iterates actions → resolves via keyword matching to regulatory bodies
- This ensures static registry always takes precedence over potentially hallucinated AI URLs

### 2D. Update Mock Data
Add URLs to the mock analysis fallback so dev mode also shows clickable links.

---

## Step 3: Update API Route

**File: `src/app/api/issues/[id]/analyze/route.ts`**

Pass URL fields through to database storage in the `.map()` calls:
- `relevantLaws` mapper: add `url: l.url`
- `rightViolations` mapper: add `legislationUrl: v.legislationUrl`
- `recommendedActions` mapper: add `actionUrl: a.actionUrl`
- `precedents` mapper: add `caseUrl: p.caseUrl`

No schema migration needed — these are `Json[]` columns, URLs are just extra fields in the JSON objects.

---

## Step 4: Update Legal Analysis Page UI

**File: `src/app/(dashboard)/issues/[id]/page.tsx`**

### 4A. Update Stored Interfaces (lines 39-68)
Add `url?`, `caseUrl?`, `actionUrl?`, `legislationUrl?` to the respective interfaces.

### 4B. Create SourceLink Component
```tsx
function SourceLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700
                  hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
      {children}
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </a>
  )
}
```
`ExternalLink` is already imported (line 30).

### 4C. Make Precedent Case Names Clickable
- Featured precedent: wrap `{precedents[0].caseName}` in `<SourceLink href={precedents[0].caseUrl}>`
- Grid precedents: wrap `{precedent.caseName}` in `<SourceLink href={precedent.caseUrl}>`

### 4D. Make Legislation Act Titles Clickable
- Wrap `{leg.actTitle}` in `<SourceLink href={leg.url}>`

### 4E. Make Recommended Actions Clickable
- Wrap `{action.title}` in `<SourceLink href={action.actionUrl}>`
- If no actionUrl, remains plain text (graceful degradation)

### 4F. Backward Compatibility
Old analyses stored without URLs will render as plain text — `SourceLink` returns `{children}` when `href` is undefined.

---

## Step 5: Update Resources Page

**File: `src/app/(dashboard)/resources/page.tsx`**

### 5A. Add URLs to Featured Resources Array
Import `resolveActUrl` from `legal-sources.ts` or add URLs directly:
- UDHR → un.org link
- Common Law Rights → legislation.gov.uk
- Magna Carta → legislation.gov.uk/aep/...
- Living Man's Rights Declaration → null (internal)

### 5B. Add URLs to Legislation Resources Array
Each act gets its legislation.gov.uk URL from the registry.

### 5C. Make "View Resource" Buttons Functional
Change non-functional buttons to `<a>` tags wrapping buttons, with `target="_blank"` and ExternalLink icon. Show "Coming Soon" if no URL.

### 5D. Consistent Link Styling
Use the same `SourceLink` pattern or brand-colored link styling as the legal analysis page.

---

## Execution Order

1. `src/lib/legal-sources.ts` — new file, no dependencies
2. `src/lib/ai-analysis.ts` — update interfaces, prompt, post-processing
3. `src/app/api/issues/[id]/analyze/route.ts` — pass URL fields through
4. `src/app/(dashboard)/issues/[id]/page.tsx` — SourceLink component + clickable references
5. `src/app/(dashboard)/resources/page.tsx` — URLs + functional buttons

---

## Verification

- [ ] Legal analysis page: case names are clickable blue links opening BAILII/National Archives in new tab
- [ ] Legal analysis page: act titles are clickable links opening legislation.gov.uk in new tab
- [ ] Legal analysis page: recommended actions link to relevant regulatory body
- [ ] Resources page: "View Resource" buttons open correct external URLs
- [ ] Resources page: legislation items link to legislation.gov.uk
- [ ] All links use `target="_blank" rel="noopener noreferrer"`
- [ ] All links show ExternalLink icon
- [ ] Links work in both light and dark mode with proper contrast
- [ ] Old analyses without URLs render gracefully (plain text, no broken links)
- [ ] AI-generated URLs are validated against domain whitelist
- [ ] Static registry takes precedence over AI-generated URLs
- [ ] Build passes: `npm run build`

---

## Future Phases (NOT this plan)

These are noted for the project roadmap:

- **Phase 3A**: In-app complaint routing — CivicShield processes IOPC/SRA/Ombudsman complaints directly rather than just linking to external sites
- **Phase 3B**: Web search integration — AI searches for related cases, FOI responses, DVSA reports to build evidence
- **Phase 3C**: FOI request automation — Generate and track Freedom of Information Act requests
- **Phase 3D**: Complaint tracking dashboard — Track status of complaints across all regulatory bodies
- **Phase 4**: Public accountability data — Aggregated complaint statistics by organization
