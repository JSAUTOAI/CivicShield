"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { resolveActUrl } from "@/lib/legal-sources"
import { toast } from "sonner"
import {
  caseLawResources,
  naturalRightsResources,
  parkingFinesResources,
  educationalResources,
  livingMansDeclaration,
} from "@/lib/resource-data"
import {
  Search,
  ExternalLink,
  Scale,
  Gavel,
  Shield,
  Car,
  BookOpen,
  Globe,
  Scroll,
  FileText,
  Plane,
  Users,
  Lock,
  AlertTriangle,
  MessageSquare,
  X,
  Copy,
  Printer,
  AlertCircle,
  GraduationCap,
  ArrowRight,
} from "lucide-react"

const featuredResources = [
  {
    title: "Universal Declaration of Human Rights",
    description: "The foundational document recognizing the inherent dignity and rights of all human beings.",
    tags: ["fundamental rights", "human dignity", "natural rights"],
    icon: Globe,
    url: "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
  },
  {
    title: "Common Law Rights in the UK",
    description: "Overview of fundamental common law rights that exist independent of statutory law.",
    tags: ["common law", "inherent rights", "legal traditions"],
    icon: Scale,
    url: "https://www.legislation.gov.uk/",
  },
  {
    title: "Magna Carta (1215)",
    description: "The historic charter that established limits on royal authority and protected individual rights.",
    tags: ["historical rights", "constitutional foundations", "limits on authority"],
    icon: Scroll,
    url: "https://www.legislation.gov.uk/aep/Edw1cc1929/25/9",
  },
  {
    title: "The Living Man's Rights Declaration",
    description: "Template for asserting natural rights as a living man/woman in legal contexts.",
    tags: ["declaration", "template", "assertion of rights"],
    icon: FileText,
    url: null,
    isDeclaration: true,
  },
]

const legislationResources = [
  { title: "Human Rights Act 1998", type: "Primary Legislation", description: "Incorporates the rights contained in the European Convention on Human Rights into UK law.", tags: ["human rights", "constitutional", "fundamental rights"], icon: Shield },
  { title: "Equality Act 2010", type: "Primary Legislation", description: "Protects against discrimination, harassment, and victimization based on protected characteristics.", tags: ["discrimination", "equality", "protected characteristics"], icon: Users },
  { title: "Freedom of Information Act 2000", type: "Primary Legislation", description: "Provides public access to information held by public authorities.", tags: ["transparency", "public authority", "information rights"], icon: BookOpen },
  { title: "Data Protection Act 2018", type: "Primary Legislation", description: "Controls how personal information is used by organizations, businesses, and the government.", tags: ["privacy", "data protection", "GDPR"], icon: Lock },
  { title: "Police and Criminal Evidence Act 1984", type: "Primary Legislation", description: "Governs police powers and protects public rights during criminal investigations.", tags: ["police powers", "criminal evidence", "rights of arrest"], icon: AlertTriangle },
  { title: "Criminal Justice Act 2003", type: "Primary Legislation", description: "Covers a wide range of criminal justice issues including sentencing and criminal proceedings.", tags: ["criminal justice", "sentencing", "court procedures"], icon: Gavel },
  { title: "Courts Act 2003", type: "Primary Legislation", description: "Establishes the framework for the courts system in England and Wales.", tags: ["courts", "legal system", "judiciary"], icon: Scale },
  { title: "Civil Procedure Rules", type: "Court Rules", description: "Rules governing civil litigation and proceedings in England and Wales.", tags: ["civil procedure", "litigation", "court procedures"], icon: FileText },
  { title: "Air Navigation Order 2016", type: "Aviation Regulation", description: "Principal legislation governing aviation and aircraft operations, including drone regulations.", tags: ["aviation", "aircraft", "drones", "flight regulations", "airspace"], icon: Plane },
  { title: "Drone and Model Aircraft Registration and Education Scheme (UK)", type: "Aviation Regulation", description: "Mandatory registration system for drone operators in the UK with safety guidance.", tags: ["drone", "regulation", "aviation", "registration", "safety"], icon: Plane },
]

type ResourceTab = "legislation" | "case_law" | "natural_rights" | "parking_fines" | "educational"

const tabsList: { value: ResourceTab; label: string; icon: React.ElementType }[] = [
  { value: "legislation", label: "Legislation", icon: Scale },
  { value: "case_law", label: "Case Law", icon: Gavel },
  { value: "natural_rights", label: "Natural Rights", icon: Shield },
  { value: "parking_fines", label: "Parking Fines", icon: Car },
  { value: "educational", label: "Educational", icon: BookOpen },
]

function matchesSearch(searchQuery: string, ...fields: (string | string[])[]): boolean {
  if (!searchQuery) return true
  const q = searchQuery.toLowerCase()
  for (const field of fields) {
    if (Array.isArray(field)) {
      if (field.some((f) => f.toLowerCase().includes(q))) return true
    } else if (field?.toLowerCase().includes(q)) {
      return true
    }
  }
  return false
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = React.useState<ResourceTab>("legislation")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showDeclaration, setShowDeclaration] = React.useState(false)
  const searchRef = React.useRef<HTMLInputElement>(null)

  // Filtered data
  const filteredLegislation = legislationResources.filter((r) =>
    matchesSearch(searchQuery, r.title, r.description, r.tags)
  )
  const filteredCaseLaw = caseLawResources.filter((r) =>
    matchesSearch(searchQuery, r.caseName, r.keyPrinciple, r.category, r.tags)
  )
  const filteredNaturalRights = naturalRightsResources.filter((r) =>
    matchesSearch(searchQuery, r.title, r.description, r.section, r.tags)
  )
  const filteredParkingFines = parkingFinesResources.filter((r) =>
    matchesSearch(searchQuery, r.title, r.description, r.section, r.tags)
  )
  const filteredEducational = educationalResources.filter((r) =>
    matchesSearch(searchQuery, r.title, r.description, r.section, r.tags)
  )

  // Get unique sections for grouping
  const getSections = <T extends { section: string }>(items: T[]) => {
    const sections: Record<string, T[]> = {}
    for (const item of items) {
      if (!sections[item.section]) sections[item.section] = []
      sections[item.section].push(item)
    }
    return sections
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
          Legal Resources
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comprehensive collection of legal resources to help you understand and assert your rights
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <Input
          ref={searchRef}
          icon={<Search className="h-4 w-4" />}
          placeholder="Search for rights, legislation, case law, or educational resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11"
        />
      </div>

      {/* Featured Section */}
      <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="mb-6 flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">
            Rights of the Natural Living Man
          </h2>
          <Badge variant="brand">Featured</Badge>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          These resources emphasize the paramount rights of the natural living man/woman that exist prior to and independent of statutory law
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredResources.map((resource) => {
            const Icon = resource.icon
            return (
              <Card key={resource.title} className="card-hover border-brand-100 dark:border-brand-900/30">
                <CardContent className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                    <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-foreground leading-tight">
                    {resource.title}
                  </h3>
                  <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {resource.url ? (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="brand" size="sm" className="w-full gap-1.5">
                        View Resource
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  ) : "isDeclaration" in resource && resource.isDeclaration ? (
                    <Button
                      variant="brand"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => setShowDeclaration(true)}
                    >
                      View Declaration
                      <FileText className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full gap-1.5" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Living Man's Declaration Modal */}
      {showDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  The Living Man&apos;s Rights Declaration
                </h2>
                <button
                  onClick={() => setShowDeclaration(false)}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <pre className="mb-6 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {livingMansDeclaration}
              </pre>
              <div className="flex items-center gap-3">
                <Button
                  variant="brand"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText(livingMansDeclaration)
                    toast.success("Declaration copied to clipboard")
                  }}
                >
                  <Copy className="h-3 w-3" />
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3 w-3" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1">
        {tabsList.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Legislation Tab */}
      {activeTab === "legislation" && (
        <div className="grid gap-4 sm:grid-cols-2 stagger-fade-in">
          {filteredLegislation.length > 0 ? filteredLegislation.map((resource) => {
            const Icon = resource.icon
            return (
              <Card key={resource.title} className="card-hover">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                        <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {resource.title}
                      </h3>
                    </div>
                    <Badge variant="info" className="text-[10px] whitespace-nowrap">
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {(() => {
                    const url = resolveActUrl(resource.title)
                    return url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                        View on legislation.gov.uk
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Link coming soon</span>
                    )
                  })()}
                </CardContent>
              </Card>
            )
          }) : (
            <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">No legislation matching &quot;{searchQuery}&quot;</div>
          )}
        </div>
      )}

      {/* Case Law Tab */}
      {activeTab === "case_law" && (
        <div className="space-y-4 animate-fade-in">
          {filteredCaseLaw.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCaseLaw.map((c) => (
                <Card key={c.caseName} className="card-hover">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{c.caseName}</h3>
                      <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 text-[10px] whitespace-nowrap">
                        {c.category}
                      </Badge>
                    </div>
                    <p className="mb-1 text-xs text-muted-foreground">
                      {c.citation} · {c.court} · {c.year}
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                      {c.keyPrinciple}
                    </p>
                    <div className="mb-3 flex flex-wrap gap-1">
                      {c.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                        View full case
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No case law matching &quot;{searchQuery}&quot;</div>
          )}
        </div>
      )}

      {/* Natural Rights Tab */}
      {activeTab === "natural_rights" && (
        <div className="space-y-8 animate-fade-in">
          {Object.entries(getSections(filteredNaturalRights)).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-4 text-sm font-bold text-foreground">{section}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((r) => (
                  <Card key={r.title} className="card-hover">
                    <CardContent className="p-5">
                      <h4 className="mb-2 text-sm font-semibold text-foreground">{r.title}</h4>
                      <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      <div className="mb-3 flex flex-wrap gap-1">
                        {r.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                      {r.sourceUrl && (
                        <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                          View source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {filteredNaturalRights.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No natural rights resources matching &quot;{searchQuery}&quot;</div>
          )}
        </div>
      )}

      {/* Parking Fines Tab */}
      {activeTab === "parking_fines" && (
        <div className="space-y-8 animate-fade-in">
          {Object.entries(getSections(filteredParkingFines)).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                {section === "Illegal Practices" && <AlertCircle className="h-4 w-4 text-red-500" />}
                {section}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((r) => (
                  <Card key={r.title} className={cn("card-hover", section === "Illegal Practices" && "border-red-200 dark:border-red-900/30")}>
                    <CardContent className="p-5">
                      <h4 className="mb-2 text-sm font-semibold text-foreground">{r.title}</h4>
                      <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      <div className="mb-3 flex flex-wrap gap-1">
                        {r.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                      {r.sourceUrl && (
                        <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                          {r.actionType === "legislation" ? "View legislation" : "Visit"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {filteredParkingFines.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No parking fines resources matching &quot;{searchQuery}&quot;</div>
          )}
          {/* CTA */}
          <Card className="border-brand-100 dark:border-brand-900/30">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Been unfairly charged?</h4>
                <p className="text-xs text-muted-foreground">Start a case and let CivicShield help you fight back</p>
              </div>
              <Link href="/issues/new">
                <Button variant="brand" size="sm" className="gap-1.5">
                  Start a Case
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Tab */}
      {activeTab === "educational" && (
        <div className="space-y-8 animate-fade-in">
          {Object.entries(getSections(filteredEducational)).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                {section === "Home Schooling" && <GraduationCap className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
                {section}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((r) => (
                  <Card key={r.title} className="card-hover">
                    <CardContent className="p-5">
                      <h4 className="mb-2 text-sm font-semibold text-foreground">{r.title}</h4>
                      <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      <div className="mb-3 flex flex-wrap gap-1">
                        {r.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                      {r.sourceUrl ? (
                        <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                          View resource
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : r.title.includes("Dictionary") ? (
                        <Link href="/dictionary" className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                          Open Legal Dictionary
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {filteredEducational.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No educational resources matching &quot;{searchQuery}&quot;</div>
          )}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <h3 className="text-base font-semibold text-foreground">
          Can&apos;t find what you&apos;re looking for?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;re constantly expanding our library of resources to help you understand and assert your rights.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => toast.info("Feature coming soon — email suggestions to support@civicshield.co.uk")}
          >
            <MessageSquare className="h-4 w-4" />
            Suggest Resource
          </Button>
          <Button
            variant="brand"
            className="gap-1.5"
            onClick={() => {
              searchRef.current?.focus()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          >
            <Search className="h-4 w-4" />
            Advanced Search
          </Button>
        </div>
      </div>
    </div>
  )
}
