"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  ExternalLink,
  Scale,
  Shield,
  ScrollText,
  Landmark,
  BookOpen,
} from "lucide-react"

type RightCategory = "all" | "constitutional" | "echr" | "common-law" | "natural-justice"

interface Right {
  title: string
  description: string
  category: RightCategory
  sourceUrl?: string
  sourceLabel?: string
  dictionarySlug?: string
}

const categories: { value: RightCategory; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Rights", icon: BookOpen },
  { value: "constitutional", label: "Constitutional", icon: ScrollText },
  { value: "echr", label: "ECHR", icon: Landmark },
  { value: "common-law", label: "Common Law", icon: Scale },
  { value: "natural-justice", label: "Natural Justice", icon: Shield },
]

const rights: Right[] = [
  // Constitutional
  {
    title: "Magna Carta (1215)",
    description: "The foundational charter establishing that no free person shall be imprisoned, dispossessed, or destroyed except by lawful judgment of their peers or by the law of the land. Established limits on royal authority and the right to due process.",
    category: "constitutional",
    sourceUrl: "https://www.legislation.gov.uk/aep/Edw1cc1929/25/9",
    sourceLabel: "legislation.gov.uk",
  },
  {
    title: "Bill of Rights 1689",
    description: "Established parliamentary sovereignty, freedom of speech in Parliament, the right to petition the monarch, and protections against cruel and unusual punishment. A cornerstone of the UK constitutional framework.",
    category: "constitutional",
    sourceUrl: "https://www.legislation.gov.uk/aep/WilsandMar2/1/2",
    sourceLabel: "legislation.gov.uk",
  },
  {
    title: "Habeas Corpus Act 1679",
    description: "Guarantees the right of any detained person to challenge the legality of their detention before a court. Prevents unlawful imprisonment by requiring authorities to justify continued detention.",
    category: "constitutional",
    sourceUrl: "https://www.legislation.gov.uk/aep/Cha2/31/2",
    sourceLabel: "legislation.gov.uk",
    dictionarySlug: "habeas-corpus",
  },
  {
    title: "Act of Settlement 1701",
    description: "Established the independence of the judiciary from the Crown, ensuring judges hold office during good behaviour rather than at royal pleasure. Foundation of judicial independence in the UK.",
    category: "constitutional",
    sourceUrl: "https://www.legislation.gov.uk/aep/Will3/12-13/2",
    sourceLabel: "legislation.gov.uk",
  },
  {
    title: "Parliament Acts 1911 & 1949",
    description: "Established the supremacy of the elected House of Commons over the House of Lords, limiting the Lords' power to delay legislation. Central to the democratic principle of representative government.",
    category: "constitutional",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/Geo5/1-2/13",
    sourceLabel: "legislation.gov.uk",
  },

  // ECHR
  {
    title: "Article 2 — Right to Life",
    description: "Everyone's right to life shall be protected by law. No one shall be deprived of their life intentionally. The state has a positive obligation to take steps to safeguard life.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 3 — Prohibition of Torture",
    description: "No one shall be subjected to torture or to inhuman or degrading treatment or punishment. This is an absolute right with no exceptions or derogations permitted.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 4 — Prohibition of Slavery",
    description: "No one shall be held in slavery or servitude, and no one shall be required to perform forced or compulsory labour. Protects against human trafficking and modern slavery.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 5 — Right to Liberty and Security",
    description: "Everyone has the right to liberty and security of person. No one shall be deprived of their liberty except in accordance with a procedure prescribed by law, and detained persons must be informed of the reasons.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 6 — Right to a Fair Trial",
    description: "Everyone is entitled to a fair and public hearing within a reasonable time by an independent and impartial tribunal. Includes the presumption of innocence and the right to legal representation.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 7 — No Punishment Without Law",
    description: "No one shall be held guilty of any criminal offence which did not constitute a criminal offence at the time it was committed. Prohibits retrospective criminal legislation.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 8 — Right to Privacy",
    description: "Everyone has the right to respect for their private and family life, their home and their correspondence. Interference by public authorities must be in accordance with law and necessary in a democratic society.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 9 — Freedom of Thought, Conscience and Religion",
    description: "Everyone has the right to freedom of thought, conscience and religion, including the freedom to change religion or belief, and to manifest religion in worship, teaching, practice and observance.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 10 — Freedom of Expression",
    description: "Everyone has the right to freedom of expression, including the freedom to hold opinions and to receive and impart information and ideas without interference by public authority.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 11 — Freedom of Assembly and Association",
    description: "Everyone has the right to freedom of peaceful assembly and to freedom of association with others, including the right to form and join trade unions for the protection of their interests.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 12 — Right to Marry",
    description: "Men and women of marriageable age have the right to marry and to found a family, according to the national laws governing the exercise of this right.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },
  {
    title: "Article 14 — Prohibition of Discrimination",
    description: "The enjoyment of Convention rights shall be secured without discrimination on any ground such as sex, race, colour, language, religion, political opinion, national or social origin, property, birth or other status.",
    category: "echr",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    sourceLabel: "echr.coe.int",
  },

  // Common Law
  {
    title: "Right to Silence",
    description: "The long-established common law right that no person is required to answer questions put to them by police or in court. While adverse inferences may be drawn in some circumstances, the fundamental right remains protected.",
    category: "common-law",
  },
  {
    title: "Right to Self-Defence",
    description: "A person may use reasonable force to defend themselves, another person, or their property from an imminent threat. The force used must be proportionate to the threat faced.",
    category: "common-law",
  },
  {
    title: "Right to Travel Freely",
    description: "The common law right of every citizen to travel freely on the King's highway without obstruction or hindrance. This includes the right to pass and repass along public roads.",
    category: "common-law",
  },
  {
    title: "Right to Privacy",
    description: "While historically weak in English common law, the right to privacy has developed through case law, particularly since the Human Rights Act 1998 incorporated Article 8 ECHR into domestic law.",
    category: "common-law",
  },
  {
    title: "Right to Trial by Jury",
    description: "A fundamental common law right dating back to Magna Carta, enabling a defendant accused of a serious criminal offence to be tried by a jury of their peers rather than by a judge alone.",
    category: "common-law",
  },
  {
    title: "Peaceful Enjoyment of Property",
    description: "The common law right to quiet enjoyment and peaceful possession of one's property without interference from others, including the state. Protected under Protocol 1, Article 1 of the ECHR.",
    category: "common-law",
  },

  // Natural Justice
  {
    title: "Fair Hearing (Audi Alteram Partem)",
    description: "The principle that no person should be judged without a fair hearing in which they have the opportunity to respond to the evidence against them. Both sides must be heard before a decision is made.",
    category: "natural-justice",
    dictionarySlug: "audi-alteram-partem",
  },
  {
    title: "No Bias (Nemo Judex in Causa Sua)",
    description: "No person should be a judge in their own cause. Decision-makers must be free from bias or any personal interest in the outcome. Even the appearance of bias can invalidate a decision.",
    category: "natural-justice",
    dictionarySlug: "nemo-judex",
  },
  {
    title: "Proportionality",
    description: "Any restriction on rights must be proportionate to the legitimate aim pursued. The means used must not be more than necessary to achieve the objective, and the impact on the individual must be balanced against the public interest.",
    category: "natural-justice",
  },
  {
    title: "Legitimate Expectation",
    description: "Where a public authority has made a clear and unambiguous promise or has established a regular practice, individuals are entitled to expect that the authority will act in accordance with that promise or practice unless there is a good reason not to.",
    category: "natural-justice",
  },
]

const categoryColors: Record<string, string> = {
  constitutional: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  echr: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "common-law": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "natural-justice": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

export default function RightsPage() {
  const [activeCategory, setActiveCategory] = React.useState<RightCategory>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredRights = rights.filter((right) => {
    const matchesCategory = activeCategory === "all" || right.category === activeCategory
    const matchesSearch =
      !searchQuery ||
      right.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      right.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
          Rights Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse fundamental rights under UK constitutional law, the ECHR, common law, and principles of natural justice
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search rights by title or description..."
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
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
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
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Results count */}
      <div className="mb-4 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {filteredRights.length} {filteredRights.length === 1 ? "right" : "rights"} found
      </div>

      {/* Rights Grid */}
      {filteredRights.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 stagger-fade-in">
          {filteredRights.map((right) => (
            <Card key={right.title} className="card-hover h-full">
              <CardContent className="p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">
                    {right.title}
                  </h3>
                  <Badge className={cn("text-[10px] whitespace-nowrap", categoryColors[right.category])}>
                    {categories.find((c) => c.value === right.category)?.label}
                  </Badge>
                </div>
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  {right.description}
                </p>
                <div className="flex items-center gap-3">
                  {right.sourceUrl && (
                    <a
                      href={right.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                    >
                      {right.sourceLabel || "View source"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {right.dictionarySlug && (
                    <Link
                      href={`/dictionary/${right.dictionarySlug}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      Dictionary
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Scale className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-foreground">No rights found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <h3 className="text-base font-semibold text-foreground">
          Need more detail on a specific right?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Check our Legal Dictionary for plain-language definitions of legal terms, or explore Case Law for judicial decisions.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href="/dictionary">
            <Button variant="outline" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              Legal Dictionary
            </Button>
          </Link>
          <Link href="/case-law">
            <Button variant="brand" className="gap-1.5">
              <Scale className="h-4 w-4" />
              Case Law Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
