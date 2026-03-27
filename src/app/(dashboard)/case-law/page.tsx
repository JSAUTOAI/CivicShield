"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  ExternalLink,
  Scale,
  Gavel,
  BookOpen,
} from "lucide-react"

type CaseCategory = "all" | "police-liberty" | "negligence" | "human-rights" | "employment" | "housing" | "consumer"

interface CaseLaw {
  caseName: string
  citation: string
  court: string
  year: number
  keyPrinciple: string
  category: CaseCategory
  url?: string
}

const categoryFilters: { value: CaseCategory; label: string }[] = [
  { value: "all", label: "All Cases" },
  { value: "police-liberty", label: "Police & Liberty" },
  { value: "negligence", label: "Negligence & Duty of Care" },
  { value: "human-rights", label: "Human Rights & Public Law" },
  { value: "employment", label: "Employment" },
  { value: "housing", label: "Housing & Property" },
  { value: "consumer", label: "Consumer" },
]

const cases: CaseLaw[] = [
  // Police & Liberty
  {
    caseName: "Entick v Carrington",
    citation: "[1765] EWHC KB J98",
    court: "Court of King's Bench",
    year: 1765,
    keyPrinciple: "Established that the state may not interfere with private property without lawful authority. General warrants were declared unlawful, forming a foundation for the protection of civil liberties and property rights against government overreach.",
    category: "police-liberty",
    url: "https://www.bailii.org/ew/cases/EWHC/KB/1765/J98.html",
  },
  {
    caseName: "Laporte v Chief Constable of Gloucestershire",
    citation: "[2006] UKHL 55",
    court: "House of Lords",
    year: 2006,
    keyPrinciple: "Affirmed the right to peaceful protest. Police cannot prevent individuals from attending a lawful demonstration on the mere suspicion that a breach of the peace might occur. Pre-emptive action must be based on imminent threat.",
    category: "police-liberty",
    url: "https://www.bailii.org/uk/cases/UKHL/2006/55.html",
  },
  {
    caseName: "Austin v Commissioner of Police of the Metropolis",
    citation: "[2009] UKHL 5",
    court: "House of Lords",
    year: 2009,
    keyPrinciple: "Addressed the legality of 'kettling' — containing large groups of people during protests. Held that containment could be justified in certain circumstances but must be proportionate and not amount to a deprivation of liberty under Article 5 ECHR.",
    category: "police-liberty",
    url: "https://www.bailii.org/uk/cases/UKHL/2009/5.html",
  },
  {
    caseName: "Rice v Connolly",
    citation: "[1966] 2 QB 414",
    court: "Queen's Bench Division",
    year: 1966,
    keyPrinciple: "Confirmed that there is no general duty for a member of the public to assist the police with their enquiries. While it may be a civic duty to help, refusal to answer questions or accompany an officer does not constitute obstruction.",
    category: "police-liberty",
    url: "https://caselaw.nationalarchives.gov.uk/ewca/civ/1966/1",
  },
  {
    caseName: "Christie v Leachinsky",
    citation: "[1947] AC 573",
    court: "House of Lords",
    year: 1947,
    keyPrinciple: "Established that a person being arrested must be informed of the true reason for their arrest at the time of arrest or as soon as practicable thereafter. Failure to do so renders the arrest unlawful.",
    category: "police-liberty",
  },

  // Negligence & Duty of Care
  {
    caseName: "Donoghue v Stevenson",
    citation: "[1932] UKHL 100",
    court: "House of Lords",
    year: 1932,
    keyPrinciple: "Established the modern law of negligence and the 'neighbour principle' — that you owe a duty of care to those who are so closely and directly affected by your actions that you ought to have them in contemplation. The foundation of tort law in the UK.",
    category: "negligence",
    url: "https://www.bailii.org/uk/cases/UKHL/1932/100.html",
  },
  {
    caseName: "Caparo Industries plc v Dickman",
    citation: "[1990] 2 AC 605",
    court: "House of Lords",
    year: 1990,
    keyPrinciple: "Established the three-part test for duty of care: (1) foreseeability of damage, (2) proximity between the parties, and (3) that it is fair, just and reasonable to impose a duty. The leading test used by UK courts today.",
    category: "negligence",
    url: "https://caselaw.nationalarchives.gov.uk/ukhl/1990/2",
  },
  {
    caseName: "Bolam v Friern Hospital Management Committee",
    citation: "[1957] 1 WLR 582",
    court: "Queen's Bench Division",
    year: 1957,
    keyPrinciple: "Established the standard of care for professionals — a professional is not negligent if they act in accordance with a practice accepted as proper by a responsible body of practitioners in that field. Known as the 'Bolam test'.",
    category: "negligence",
  },
  {
    caseName: "Hedley Byrne & Co Ltd v Heller & Partners Ltd",
    citation: "[1964] AC 465",
    court: "House of Lords",
    year: 1964,
    keyPrinciple: "Established liability for negligent misstatement causing pure economic loss where a special relationship of reliance exists between the parties. Extended duty of care beyond physical damage to financial harm caused by careless advice.",
    category: "negligence",
  },

  // Human Rights & Public Law
  {
    caseName: "Ridge v Baldwin",
    citation: "[1964] UKHL 2",
    court: "House of Lords",
    year: 1964,
    keyPrinciple: "Revived the principles of natural justice in administrative law. Held that a chief constable dismissed without a hearing was denied natural justice. Decision-makers must follow fair procedures, even where statute is silent on the matter.",
    category: "human-rights",
    url: "https://www.bailii.org/uk/cases/UKHL/1963/2.html",
  },
  {
    caseName: "Associated Provincial Picture Houses v Wednesbury Corporation",
    citation: "[1948] 1 KB 223",
    court: "Court of Appeal",
    year: 1948,
    keyPrinciple: "Established the 'Wednesbury unreasonableness' test — a decision can be challenged if it is so unreasonable that no reasonable authority could ever have come to it. The foundational test for judicial review of administrative action in English law.",
    category: "human-rights",
  },
  {
    caseName: "R (Daly) v Secretary of State for the Home Department",
    citation: "[2001] UKHL 26",
    court: "House of Lords",
    year: 2001,
    keyPrinciple: "Established that proportionality is a more structured and demanding test than Wednesbury reasonableness when human rights are engaged. Courts must examine whether the interference with rights is proportionate to the legitimate aim pursued.",
    category: "human-rights",
  },
  {
    caseName: "Golder v United Kingdom",
    citation: "[1975] 1 EHRR 524",
    court: "European Court of Human Rights",
    year: 1975,
    keyPrinciple: "Established that Article 6 ECHR includes an implied right of access to a court. A prisoner's right to consult a solicitor with a view to bringing civil proceedings could not be restricted without justification.",
    category: "human-rights",
  },
  {
    caseName: "Smith v Ministry of Defence",
    citation: "[2013] UKSC 41",
    court: "Supreme Court",
    year: 2013,
    keyPrinciple: "Confirmed that the Article 2 right to life can impose positive obligations on the state to protect the lives of soldiers, including when serving abroad. The government owes a duty of care to provide adequate equipment and training.",
    category: "human-rights",
  },

  // Employment
  {
    caseName: "Polkey v AE Dayton Services Ltd",
    citation: "[1988] AC 344",
    court: "House of Lords",
    year: 1988,
    keyPrinciple: "Established that procedural fairness is essential in dismissal cases. Even if dismissal would have occurred regardless, failure to follow a fair procedure renders the dismissal unfair. Procedural justice cannot be bypassed based on the likely outcome.",
    category: "employment",
  },
  {
    caseName: "British Home Stores Ltd v Burchell",
    citation: "[1980] ICR 303",
    court: "Employment Appeal Tribunal",
    year: 1980,
    keyPrinciple: "Established the three-stage test for fair dismissal based on misconduct: (1) the employer must genuinely believe in the employee's guilt, (2) that belief must be based on reasonable grounds, and (3) a reasonable investigation must have been carried out.",
    category: "employment",
  },
  {
    caseName: "Western Excavating (ECC) Ltd v Sharp",
    citation: "[1978] QB 761",
    court: "Court of Appeal",
    year: 1978,
    keyPrinciple: "Defined the test for constructive dismissal — the employer must have committed a significant breach of the employment contract (express or implied terms), the employee must have left because of that breach, and must not have affirmed the contract by delay.",
    category: "employment",
  },
  {
    caseName: "Malik v Bank of Credit and Commerce International SA",
    citation: "[1998] AC 20",
    court: "House of Lords",
    year: 1998,
    keyPrinciple: "Established that there is an implied term of mutual trust and confidence in every employment contract. An employer must not, without reasonable cause, conduct itself in a manner calculated or likely to destroy or seriously damage the relationship of trust and confidence.",
    category: "employment",
  },

  // Housing & Property
  {
    caseName: "Street v Mountford",
    citation: "[1985] AC 809",
    court: "House of Lords",
    year: 1985,
    keyPrinciple: "Established the distinction between a tenancy and a licence. Where an occupant has exclusive possession of premises for a term at a rent, the arrangement is a tenancy regardless of what the parties call it. Substance prevails over the label used.",
    category: "housing",
  },
  {
    caseName: "Southwark London Borough Council v Mills",
    citation: "[2001] 1 AC 1",
    court: "House of Lords",
    year: 2001,
    keyPrinciple: "Clarified landlord obligations regarding nuisance from neighbouring properties. A landlord is not automatically liable for nuisance caused by other tenants unless the landlord has authorised the nuisance or has a duty and power to prevent it.",
    category: "housing",
  },
  {
    caseName: "Bruton v London & Quadrant Housing Trust",
    citation: "[2000] 1 AC 406",
    court: "House of Lords",
    year: 2000,
    keyPrinciple: "Held that a tenancy can be created even where the landlord does not have a proprietary estate in the property. The grant of exclusive possession for a term at a rent creates a tenancy as a matter of law, regardless of the grantor's own title.",
    category: "housing",
  },

  // Consumer
  {
    caseName: "Carlill v Carbolic Smoke Ball Company",
    citation: "[1893] 1 QB 256",
    court: "Court of Appeal",
    year: 1893,
    keyPrinciple: "Established the concept of unilateral contracts and consumer protection against misleading advertising. A company's public promise (to pay £100 to anyone who used their product and still caught flu) was held to be a binding offer accepted by performance.",
    category: "consumer",
  },
]

const categoryColors: Record<string, string> = {
  "police-liberty": "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  negligence: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "human-rights": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  employment: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  housing: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  consumer: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

const courtColors: Record<string, string> = {
  "House of Lords": "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
  "Supreme Court": "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
  "Court of Appeal": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Court of King's Bench": "bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  "Queen's Bench Division": "bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  "Employment Appeal Tribunal": "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "European Court of Human Rights": "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
}

export default function CaseLawPage() {
  const [activeCategory, setActiveCategory] = React.useState<CaseCategory>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredCases = cases.filter((c) => {
    const matchesCategory = activeCategory === "all" || c.category === activeCategory
    const matchesSearch =
      !searchQuery ||
      c.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.keyPrinciple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citation.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
          Case Law Library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Key UK judicial decisions that define and protect your rights — from landmark constitutional cases to everyday consumer law
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search cases by name, citation, or legal principle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11"
        />
      </div>

      {/* Category Filter Pills */}
      <div
        className="mb-6 flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        {categoryFilters.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              activeCategory === cat.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.value === "all" && <Scale className="h-4 w-4" />}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-4 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {filteredCases.length} {filteredCases.length === 1 ? "case" : "cases"} found
      </div>

      {/* Cases Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 stagger-fade-in">
          {filteredCases.map((c) => (
            <Card key={c.caseName} className="card-hover h-full">
              <CardContent className="p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-tight">
                      {c.caseName}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.citation}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold text-muted-foreground">
                    {c.year}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <Badge className={cn("text-[10px]", courtColors[c.court] || "bg-muted text-muted-foreground")}>
                    {c.court}
                  </Badge>
                  <Badge className={cn("text-[10px]", categoryColors[c.category] || "bg-muted text-muted-foreground")}>
                    {categoryFilters.find((f) => f.value === c.category)?.label}
                  </Badge>
                </div>

                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  {c.keyPrinciple}
                </p>

                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    Read full judgment
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Gavel className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-foreground">No cases found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
          <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Legal Information, Not Legal Advice
        </h3>
        <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
          This case law library is for educational and informational purposes only.
          It does not constitute legal advice. For guidance on your specific situation,
          consult a qualified legal professional.
        </p>
      </div>
    </div>
  )
}
