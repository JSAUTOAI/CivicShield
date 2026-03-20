"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"

const featuredResources = [
  {
    title: "Universal Declaration of Human Rights",
    description: "The foundational document recognizing the inherent dignity and rights of all human beings.",
    tags: ["fundamental rights", "human dignity", "natural rights"],
    icon: Globe,
  },
  {
    title: "Common Law Rights in the UK",
    description: "Overview of fundamental common law rights that exist independent of statutory law.",
    tags: ["common law", "inherent rights", "legal traditions"],
    icon: Scale,
  },
  {
    title: "Magna Carta (1215)",
    description: "The historic charter that established limits on royal authority and protected individual rights.",
    tags: ["historical rights", "constitutional foundations", "limits on authority"],
    icon: Scroll,
  },
  {
    title: "The Living Man's Rights Declaration",
    description: "Template for asserting natural rights as a living man/woman in legal contexts.",
    tags: ["declaration", "template", "assertion of rights"],
    icon: FileText,
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

const tabs: { value: ResourceTab; label: string; icon: React.ElementType }[] = [
  { value: "legislation", label: "Legislation", icon: Scale },
  { value: "case_law", label: "Case Law", icon: Gavel },
  { value: "natural_rights", label: "Natural Rights", icon: Shield },
  { value: "parking_fines", label: "Parking Fines", icon: Car },
  { value: "educational", label: "Educational", icon: BookOpen },
]

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = React.useState<ResourceTab>("legislation")
  const [searchQuery, setSearchQuery] = React.useState("")

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          icon={<Search className="h-4 w-4" />}
          placeholder="Search for rights, legislation, case law, or educational resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11"
        />
      </div>

      {/* Featured Section */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
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
                  <Button variant="brand" size="sm" className="w-full gap-1.5">
                    View Resource
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1">
        {tabs.map((tab) => {
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

      {/* Legislation Grid */}
      {activeTab === "legislation" && (
        <div className="grid gap-4 sm:grid-cols-2 stagger-fade-in">
          {legislationResources.map((resource) => {
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
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">
                    View Resource
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== "legislation" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-base font-semibold text-foreground">
              {tabs.find((t) => t.value === activeTab)?.label} Resources
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Resources for this category are being compiled. Check back soon.
            </p>
          </CardContent>
        </Card>
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
          <Button variant="outline" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Suggest Resource
          </Button>
          <Button variant="brand" className="gap-1.5">
            <Search className="h-4 w-4" />
            Advanced Search
          </Button>
        </div>
      </div>
    </div>
  )
}
