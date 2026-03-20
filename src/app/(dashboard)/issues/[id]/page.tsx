"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LegalAnalysisResult } from "@/lib/ai-analysis"
import {
  ArrowLeft,
  Edit,
  History,
  Info,
  AlertTriangle,
  Scale,
  Gavel,
  BookOpen,
  FileText,
  Send,
  Trash2,
  RefreshCw,
  Save,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Shield,
  CheckCircle,
} from "lucide-react"

// Mock data for display — replaced by API call when DB connected
const mockIssue = {
  id: 4,
  issueType: "Bailiff/Enforcement",
  issueCategory: "Public Sector & Government",
  description:
    "a bailiff has trespassed on my property after having implied rights of access removed this bailiff has enter into my home with force and has proceeded to harrass me and cause alram distress and tried to bully me into paying him money i have no writen contract with anyone todo with this debt and i refuse to pay it under duress",
  organization: "exodus",
  location: "swansea",
  dateOfIncident: "12/03/2026",
  timeOfIncident: "07:00",
}

const mockAnalysis: LegalAnalysisResult = {
  summary:
    "Defending the rights of the living man under UK legislation and common law",
  rightsViolations: [
    {
      type: "Trespass",
      description:
        "If the implied right of access was revoked, any entry onto the property may constitute trespass unless specific legal authority was obtained.",
      legalResponse:
        '"I do not consent to this violation of my trespass. Under applicable law, I request that you cease this action immediately and respect my lawful rights."',
      severity: "high",
    },
    {
      type: "Harassment",
      description:
        "The actions of the bailiff could be considered harassment if they involved threatening behavior or caused significant alarm and distress.",
      legalResponse:
        '"I do not consent to this violation of my harassment. Under Protection from Harassment Act 1997, I request that you cease this action immediately and respect my lawful rights."',
      severity: "high",
    },
  ],
  precedents: [
    {
      caseName: "Evans v. South Ribble Borough Council [1993]",
      caseReference: "[1993] QB 426",
      year: "1993",
      court: "UK High Court",
      courtLevel: "High Court",
      keyPrinciple:
        "This case dealt with unauthorized entry by enforcement officers, reinforcing the notion that bailiffs must adhere strictly to entry rights and can be held liable for any trespass.",
      relevance:
        "Establishes rights protection in similar contexts.",
      legalDeclaration:
        '"With reference to the precedent established in Evans, I assert that my rights in this context must be upheld."',
      isBinding: false,
    },
    {
      caseName: "R v. Bogdal [2011]",
      caseReference: "R v. Bogdal [2011]",
      year: "2011",
      court: "Crown Court",
      courtLevel: "Crown Court",
      keyPrinciple:
        "This case considered harassment by bailiffs and supported the use of the Protection from Harassment Act 1997 in similar circumstances.",
      relevance: "Directly relevant to harassment claims against enforcement agents.",
      legalDeclaration:
        '"As established in R, I assert my right to..."',
      isBinding: false,
    },
    {
      caseName: "Laporte v Chief Constable of Gloucestershire [2006] UKHL 55",
      caseReference: "[2006] UKHL 55",
      year: "2006",
      court: "House of Lords",
      courtLevel: "House of Lords",
      keyPrinciple:
        "Establishes that police must act proportionately when restricting liberty and freedom of movement.",
      relevance: "Authorities must act proportionately in restricting rights.",
      legalDeclaration:
        '"Police actions restricting my liberty must be proportionate to any legitimate aim."',
      isBinding: true,
    },
    {
      caseName: "Austin v Commissioner of Police of the Metropolis [2009] UKHL 5",
      caseReference: "[2009] UKHL 5",
      year: "2009",
      court: "House of Lords",
      courtLevel: "House of Lords",
      keyPrinciple:
        "Concerns the lawfulness of containment ('kettling') by police and the threshold for deprivation of liberty.",
      relevance: "Any restriction of movement by authorities must be justified.",
      legalDeclaration:
        '"Any restriction of my movement by authorities must be justified, necessary and proportionate."',
      isBinding: true,
    },
    {
      caseName: "Javed v British Gas Trading Ltd [2021] EWHC 2682",
      caseReference: "[2021] EWHC 2682",
      year: "2021",
      court: "High Court",
      courtLevel: "High Court",
      keyPrinciple:
        "Concerns the lawfulness of bailiff/enforcement actions and proper notification requirements.",
      relevance: "Enforcement agents must provide proper notice.",
      legalDeclaration:
        '"Enforcement agents must provide proper notice before taking enforcement action."',
      isBinding: false,
    },
    {
      caseName: "R (Wandsworth LBC) v Magistrates' Court [2003] EWHC 2083",
      caseReference: "[2003] EWHC 2083",
      year: "2003",
      court: "High Court",
      courtLevel: "High Court",
      keyPrinciple:
        "Established principles for warrants of entry and execution by bailiffs.",
      relevance: "Bailiffs must have proper and valid warrants.",
      legalDeclaration:
        '"Bailiffs must have proper and valid warrants before entering my property."',
      isBinding: false,
    },
  ],
  legislation: [
    {
      actTitle: "Tribunals, Courts and Enforcement Act 2007",
      description:
        "This Act outlines the powers and responsibilities of enforcement agents (bailiffs), including conduct rules and entry rights.",
      legalDeclaration:
        '"I invoke my rights under Tribunals, Courts and Enforcement Act 2007. This legislation clearly establishes that my rights in this matter must be respected."',
      relevance: "Directly governs bailiff conduct.",
    },
    {
      actTitle: "Protection from Harassment Act 1997",
      description:
        "This Act provides protection against harassment and can be applied if a bailiff\'s conduct causes fear, alarm, or distress.",
      legalDeclaration:
        '"I invoke my rights under Protection from Harassment Act 1997. This legislation clearly establishes that my rights in this matter must be respected."',
      relevance: "Applicable where enforcement conduct constitutes harassment.",
    },
    {
      actTitle: "The Taking Control of Goods Regulations 2013",
      description:
        "These Regulations stipulate the procedures that bailiffs must follow, including restrictions on forceful entry and conduct standards.",
      legalDeclaration:
        '"I invoke my rights under The Taking Control of Goods Regulations 2013. This legislation clearly establishes that my rights in this matter must be respected."',
      relevance: "Sets out specific procedural rules for bailiffs.",
    },
  ],
  recommendedActions: [
    {
      title: "File a Complaint with the Bailiff's Creditor or Agency",
      description:
        "To address the misconduct, start by filing a formal complaint with the creditors or the agency that employed the bailiff.",
      priority: "primary",
    },
    {
      title: "Report to the Police",
      description:
        "If you believe criminal acts like trespassing or harassment occurred, report the incident to the police.",
      priority: "secondary",
    },
    {
      title: "Consult a Solicitor",
      description:
        "Consult with a solicitor experienced in civil rights or consumer law to explore potential legal actions against the bailiff.",
      priority: "secondary",
    },
  ],
  complaintText: `[Your Address]
[City, Postcode]
[Date]

Exodus Enforcement Agency
[Agency's Address]
[City, Postcode]

Dear Sir/Madam,

Subject: Formal Complaint Regarding Bailiff Misconduct and Rights Violation

I am writing to formally register a complaint regarding an incident that took place on 12/03/2026 at approximately 07:00 at my property in Swansea.

A bailiff acting on behalf of your agency trespassed on my property after having implied rights of access removed. The bailiff entered my home with force and proceeded to harass me, cause alarm and distress, and attempted to coerce me into making payment under duress. I have no written contract with any party in relation to this alleged debt and refuse to pay under duress.

This conduct constitutes a breach of my fundamental rights under both statutory and common law. Specifically:

1. The Tribunals, Courts and Enforcement Act 2007 — which sets out the powers and limitations of enforcement agents
2. The Taking Control of Goods Regulations 2013 — which prescribes the procedures that must be followed
3. The Protection from Harassment Act 1997 — which prohibits conduct causing alarm or distress

I request that you:
1. Acknowledge receipt of this complaint within 14 days
2. Conduct a thorough investigation into the conduct described
3. Provide a full written response within 28 days
4. Take appropriate disciplinary action
5. Confirm measures to prevent similar incidents

I reserve the right to escalate this matter to the relevant regulatory body and to pursue legal action should a satisfactory response not be received.

Yours faithfully,

[Your Name]`,
  complaintRecipient: {
    name: "Complaints Department",
    organization: "Exodus Enforcement Agency",
    address: "[Agency's Address]",
  },
  ccRecipients: [
    {
      name: "Civil Enforcement Association",
      organization: "CIVEA",
      role: "Industry regulatory body for enforcement agents",
    },
  ],
}

const courtLevelColors: Record<string, string> = {
  "House of Lords": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Supreme Court": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "High Court": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Court of Appeal": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Crown Court": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
}

export default function IssueDetailPage() {
  const params = useParams()
  const [analysis] = React.useState<LegalAnalysisResult>(mockAnalysis)
  const [issue] = React.useState(mockIssue)
  const [complaintText, setComplaintText] = React.useState(mockAnalysis.complaintText)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <Link
          href="/issues"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Legal Analysis</h1>
      </div>

      {/* Issue Summary */}
      <Card className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Issue Summary</h2>
              <p className="text-xs text-muted-foreground">
                {issue.issueType} Issue #{params.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <History className="h-4 w-4" />
                History
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Issue Details
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {issue.description}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">
                  Authority Involved
                </span>
              </div>
              <p className="text-sm font-medium">{issue.organization}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {issue.dateOfIncident} at {issue.timeOfIncident} — {issue.location}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Analysis Header */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-lg font-semibold text-foreground">Legal Analysis</h2>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </div>

      {/* Rights Violations */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-base font-semibold text-foreground">
            Rights Violations
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {analysis.rightsViolations.map((violation) => (
            <Card
              key={violation.type}
              className="border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/5"
            >
              <CardContent className="p-5">
                <h4 className="mb-2 text-sm font-bold text-red-700 dark:text-red-400">
                  {violation.type}
                </h4>
                <p className="mb-3 text-sm text-red-800/80 dark:text-red-300/80 leading-relaxed">
                  {violation.description}
                </p>
                <div>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                    Legal Response:
                  </p>
                  <p className="text-xs italic text-red-800/70 dark:text-red-300/70 leading-relaxed">
                    {violation.legalResponse}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Legal Precedents & Case Law */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="mb-4 flex items-center gap-2">
          <Gavel className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-semibold text-foreground">
            Legal Precedents & Case Law
          </h3>
        </div>

        {/* Legal Framework banner */}
        <Card className="mb-4 border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/5">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              Legal Framework:
            </p>
            <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
              These precedents establish the legal framework protecting your
              rights. Citing these cases in communications with authorities
              significantly strengthens your position and demonstrates legal
              knowledge.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Info className="h-3.5 w-3.5" />
              Click on any case name to view full case details
            </p>
          </CardContent>
        </Card>

        {/* Featured first precedent */}
        {analysis.precedents.length > 0 && (
          <Card className="mb-4 card-hover">
            <CardContent className="p-6">
              <h4 className="mb-2 text-base font-bold text-brand-700 dark:text-brand-400">
                {analysis.precedents[0].caseName}
              </h4>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                {analysis.precedents[0].keyPrinciple}
              </p>

              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div>
                  <p className="text-xs font-semibold text-foreground">Key Principle</p>
                  <p className="text-xs text-muted-foreground">{analysis.precedents[0].relevance}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Jurisdiction</p>
                  <p className="text-xs text-muted-foreground">{analysis.precedents[0].court}</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 mb-3">
                <p className="text-xs font-semibold text-foreground mb-1">Legal Declaration Template</p>
                <p className="text-xs italic text-muted-foreground">
                  {analysis.precedents[0].legalDeclaration}
                </p>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  View Full Case Report
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Remaining precedents in grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {analysis.precedents.slice(1).map((precedent) => (
            <Card key={precedent.caseReference} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-foreground leading-tight">
                    {precedent.caseName}
                  </h4>
                  {courtLevelColors[precedent.courtLevel] && (
                    <span
                      className={cn(
                        "ml-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium",
                        courtLevelColors[precedent.courtLevel]
                      )}
                    >
                      {precedent.courtLevel}
                    </span>
                  )}
                </div>
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  {precedent.keyPrinciple}
                </p>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-semibold">Citation: </span>
                    <span className="text-muted-foreground">{precedent.caseReference}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Legal Response: </span>
                    <span className="italic text-muted-foreground">
                      {precedent.legalDeclaration}
                    </span>
                  </div>
                </div>
                <button className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  View Full Case
                  <ExternalLink className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Relevant Legislation */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
        <div className="mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-semibold text-foreground">
            Relevant Legislation
          </h3>
        </div>

        {/* Legal Protection Statement */}
        <Card className="mb-4 border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/5">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
              Legal Protection Statement:
            </p>
            <p className="text-sm italic text-red-800/80 dark:text-red-300/80 leading-relaxed">
              &ldquo;I am aware of my rights under the following legislation and
              hereby invoke these protections. I request that you proceed in
              accordance with these laws and respect my rights as a living
              man/woman.&rdquo;
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {analysis.legislation.map((leg) => (
            <Card key={leg.actTitle} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                    <BookOpen className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {leg.actTitle}
                  </h4>
                </div>
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  {leg.description}
                </p>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-semibold mb-1">Legal Declaration:</p>
                  <p className="text-xs italic text-muted-foreground">
                    {leg.legalDeclaration}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Complaint Template */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Your Complaint Template
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your saved complaint is ready for use
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </Button>
                <Button variant="success" size="sm" className="gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  Build a Case
                </Button>
                <Button variant="brand" size="sm" className="gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Send Complaint
                </Button>
              </div>
            </div>

            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className="w-full min-h-[400px] rounded-lg border border-border bg-muted/30 p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </CardContent>
        </Card>
      </section>

      {/* Recommended Actions */}
      <section className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Recommended Actions
          </h3>
          <p className="text-xs text-muted-foreground">
            Steps you can take based on this analysis
          </p>
        </div>

        <div className="space-y-3">
          {analysis.recommendedActions.map((action, i) => (
            <Card
              key={action.title}
              className={cn(
                "card-hover",
                action.priority === "primary" && "border-emerald-200 dark:border-emerald-900/30"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  {action.priority === "primary" ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <h4
                      className={cn(
                        "text-sm font-semibold",
                        action.priority === "primary"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-foreground"
                      )}
                    >
                      {action.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                    {action.priority === "primary" && (
                      <Button variant="brand" size="sm" className="mt-3 gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate Complaint Template
                      </Button>
                    )}
                    {action.priority === "secondary" && (
                      <button className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        {action.title.includes("Police")
                          ? "Reporting a crime to the police"
                          : "Finding a solicitor"}{" "}
                        <ExternalLink className="inline h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Steps */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Additional Steps</h4>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              If you believe criminal acts like trespassing or harassment occurred, report the incident to the police.
              <br />
              <a href="#" className="text-brand-600 hover:underline dark:text-brand-400">
                Reporting a crime to the police <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
            <p className="flex items-start gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Consult with a solicitor experienced in civil rights or consumer law to explore potential legal actions.
              <br />
              <a href="#" className="text-brand-600 hover:underline dark:text-brand-400">
                Finding a solicitor <ExternalLink className="inline h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
