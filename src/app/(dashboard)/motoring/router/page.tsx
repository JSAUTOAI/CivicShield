"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Navigation, RotateCcw } from "lucide-react"

interface Question {
  id: string
  question: string
  options: { value: string; label: string; description?: string }[]
}

const QUESTIONS: Question[] = [
  {
    id: "purchase_source",
    question: "Where was the vehicle purchased?",
    options: [
      { value: "dealer", label: "Franchised Dealer", description: "Manufacturer-approved dealer" },
      { value: "independent", label: "Independent Dealer", description: "Non-franchised used car dealer" },
      { value: "private", label: "Private Sale", description: "Bought from an individual" },
      { value: "online", label: "Online Marketplace", description: "AutoTrader, eBay, Cinch, etc." },
      { value: "auction", label: "Auction", description: "BCA, Copart, or similar" },
    ],
  },
  {
    id: "purchase_date",
    question: "When was the vehicle purchased?",
    options: [
      { value: "under_30_days", label: "Under 30 days ago", description: "Full right to reject" },
      { value: "30_days_to_6_months", label: "30 days to 6 months ago", description: "Burden of proof on retailer" },
      { value: "6_months_to_6_years", label: "6 months to 6 years ago", description: "You must prove the fault existed at sale" },
      { value: "over_6_years", label: "Over 6 years ago", description: "Outside standard limitation period" },
    ],
  },
  {
    id: "issue_type",
    question: "What type of issue are you experiencing?",
    options: [
      { value: "safety", label: "Safety Defect", description: "The vehicle is dangerous to drive" },
      { value: "mechanical", label: "Mechanical Failure", description: "Something has broken or stopped working" },
      { value: "financial", label: "Finance / Payment Issue", description: "Problems with PCP, HP, or finance agreement" },
      { value: "administrative", label: "Administrative / Registration", description: "DVLA, V5C, tax, or registration issues" },
      { value: "enforcement", label: "Seizure / Clamping", description: "Vehicle seized, clamped, or impounded" },
    ],
  },
  {
    id: "safety_impact",
    question: "Does this issue affect the safety of the vehicle or other road users?",
    options: [
      { value: "yes", label: "Yes", description: "The fault makes the vehicle dangerous" },
      { value: "unsure", label: "Unsure", description: "I'm not certain if it's a safety risk" },
      { value: "no", label: "No", description: "The fault is inconvenient but not dangerous" },
    ],
  },
  {
    id: "finance_involved",
    question: "Is there a finance agreement on the vehicle?",
    options: [
      { value: "pcp", label: "PCP (Personal Contract Purchase)" },
      { value: "hp", label: "HP (Hire Purchase)" },
      { value: "loan", label: "Personal Loan" },
      { value: "cash", label: "Paid in Cash / No Finance" },
      { value: "unknown", label: "Not sure" },
    ],
  },
  {
    id: "repair_attempted",
    question: "Has a repair been attempted?",
    options: [
      { value: "yes_same", label: "Yes — same fault returned", description: "Repaired but the issue came back" },
      { value: "yes_different", label: "Yes — different issue appeared", description: "Repaired but caused a new problem" },
      { value: "no", label: "No repair attempted", description: "Haven't had it repaired yet" },
      { value: "refused", label: "Repair refused", description: "Manufacturer or dealer declined to repair" },
    ],
  },
]

interface ClassificationResult {
  issueCategory: string
  categorySlug: string
  recommendedAuthority: { name: string; role: string }
  secondaryAuthority?: { name: string; role: string }
  suggestedAction: string
  riskLevel: "low" | "medium" | "high"
  legalPosition: string
}

function classifyIssue(answers: Record<string, string>): ClassificationResult {
  const { purchase_source, purchase_date, issue_type, safety_impact, finance_involved, repair_attempted } = answers

  // Safety defects — highest priority
  if (issue_type === "safety" || safety_impact === "yes") {
    return {
      issueCategory: "Vehicle Safety Defects & Recalls",
      categorySlug: "vehicle-safety-defects",
      recommendedAuthority: { name: "DVSA", role: "Report the safety defect — they oversee vehicle safety standards and recalls" },
      secondaryAuthority: { name: "Vehicle Manufacturer", role: "Formal complaint demanding repair under Consumer Rights Act 2015" },
      suggestedAction: "Report the safety defect to DVSA immediately, then send a formal complaint to the manufacturer citing Consumer Rights Act 2015 s.9 (satisfactory quality) and General Product Safety Regulations 2005.",
      riskLevel: "high",
      legalPosition: "A vehicle with a safety defect is not of satisfactory quality under s.9 CRA 2015. The manufacturer has duties under the General Product Safety Regulations 2005 to monitor, notify, and recall.",
    }
  }

  // Enforcement / seizure
  if (issue_type === "enforcement") {
    return {
      issueCategory: "Enforcement / Seizure Issues",
      categorySlug: "enforcement-seizure",
      recommendedAuthority: { name: "The Seizing Authority", role: "Demand written grounds for seizure and your rights" },
      secondaryAuthority: { name: "IOPC", role: "If police conducted the seizure improperly" },
      suggestedAction: "Challenge the seizure in writing immediately. Request the grounds for seizure and evidence. If police-related, consider IOPC complaint.",
      riskLevel: "high",
      legalPosition: "Vehicle seizure requires lawful authority. Under the Protection of Freedoms Act 2012, wheel clamping on private land is illegal in England and Wales.",
    }
  }

  // Administrative / DVLA
  if (issue_type === "administrative") {
    return {
      issueCategory: "DVLA / Registration Issues",
      categorySlug: "dvla-registration-issues",
      recommendedAuthority: { name: "DVLA", role: "Contact DVLA directly to resolve the registration or licensing issue" },
      secondaryAuthority: { name: "PHSO", role: "If DVLA's complaints process fails, escalate to the Parliamentary Ombudsman" },
      suggestedAction: "Contact DVLA's customer service in writing with your V5C reference. If unresolved after their complaints process, escalate to PHSO.",
      riskLevel: "low",
      legalPosition: "DVLA is a government agency subject to the Parliamentary Ombudsman. Maladministration can be investigated.",
    }
  }

  // Finance disputes
  if (issue_type === "financial" || (finance_involved === "pcp" || finance_involved === "hp")) {
    return {
      issueCategory: "Motor Finance Disputes",
      categorySlug: "motor-finance-disputes",
      recommendedAuthority: { name: "Finance Provider", role: "Under s.75 CCA 1974, the finance provider is jointly liable with the dealer" },
      secondaryAuthority: { name: "Financial Ombudsman Service", role: "Independent dispute resolution — can award up to £415,000" },
      suggestedAction: "Submit a formal complaint to your finance provider citing s.75 Consumer Credit Act 1974. If unresolved after 8 weeks, escalate to the Financial Ombudsman.",
      riskLevel: "medium",
      legalPosition: finance_involved === "pcp" || finance_involved === "hp"
        ? "Under s.75 CCA 1974, the finance provider is jointly liable for any breach of contract or misrepresentation where the credit is between £100 and £30,000."
        : "Your finance agreement may give you additional rights. The FCA requires fair treatment of customers.",
    }
  }

  // Dealer sale issues — based on purchase date
  if (purchase_source === "dealer" || purchase_source === "independent" || purchase_source === "online") {
    if (purchase_date === "under_30_days") {
      return {
        issueCategory: "Dealer Sale Issues",
        categorySlug: "dealer-sale-issues",
        recommendedAuthority: { name: "The Selling Dealer", role: "You have the right to a FULL REFUND within 30 days under s.20 CRA 2015" },
        secondaryAuthority: { name: "Trading Standards", role: "If the dealer refuses, report them for breaching consumer law" },
        suggestedAction: "Exercise your short-term right to reject under s.20 CRA 2015. Send a formal rejection letter to the dealer demanding a full refund within 14 days.",
        riskLevel: "medium",
        legalPosition: "Within 30 days of purchase, you have an absolute right to reject faulty goods for a full refund under s.20 Consumer Rights Act 2015.",
      }
    }

    if (purchase_date === "30_days_to_6_months") {
      const hasFailedRepair = repair_attempted === "yes_same"
      return {
        issueCategory: hasFailedRepair ? "Poor Repairs / Repeat Failures" : "Dealer Sale Issues",
        categorySlug: hasFailedRepair ? "poor-repairs" : "dealer-sale-issues",
        recommendedAuthority: { name: "The Selling Dealer", role: "Burden of proof is on the dealer — they must prove the fault wasn't present at sale" },
        secondaryAuthority: { name: "Motor Ombudsman", role: "Independent dispute resolution if the dealer is a member" },
        suggestedAction: hasFailedRepair
          ? "The dealer has had their one chance to repair and failed. You now have the final right to reject under s.24 CRA 2015, or claim a price reduction."
          : "Request a repair or replacement from the dealer. Under s.19(14) CRA 2015, the burden of proof is on the dealer for the first 6 months.",
        riskLevel: "medium",
        legalPosition: "Within 6 months, the burden of proof is reversed — the dealer must prove the fault was not present at the time of sale (s.19(14) CRA 2015).",
      }
    }
  }

  // Repair issues
  if (repair_attempted === "yes_same" || repair_attempted === "yes_different") {
    return {
      issueCategory: "Poor Repairs / Repeat Failures",
      categorySlug: "poor-repairs",
      recommendedAuthority: { name: "The Repairing Garage", role: "Services must be performed with reasonable care and skill under s.49 CRA 2015" },
      secondaryAuthority: { name: "Motor Ombudsman", role: "If the garage is a TMO member" },
      suggestedAction: "Send a formal complaint to the garage citing s.49 CRA 2015. Get an independent inspection to document the substandard work.",
      riskLevel: "medium",
      legalPosition: "Under s.49 CRA 2015, services must be performed with reasonable care and skill. If a repair fails or causes further damage, the garage is liable.",
    }
  }

  // Default — general mechanical / warranty
  return {
    issueCategory: "Warranty & Goodwill Disputes",
    categorySlug: "warranty-goodwill-disputes",
    recommendedAuthority: { name: "Vehicle Manufacturer", role: "Request escalation to a senior case manager" },
    secondaryAuthority: { name: "Motor Ombudsman", role: "Independent dispute resolution for warranty complaints" },
    suggestedAction: "Escalate your complaint within the manufacturer's customer relations team. If unresolved, file with the Motor Ombudsman.",
    riskLevel: "low",
    legalPosition: "Statutory rights under the Consumer Rights Act 2015 exist independently of any warranty. A warranty cannot reduce your legal rights (s.31 CRA 2015).",
  }
}

export default function MotoringRouterPage() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [result, setResult] = React.useState<ClassificationResult | null>(null)

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setResult(classifyIssue(newAnswers))
    }
  }

  const reset = () => {
    setCurrentStep(0)
    setAnswers({})
    setResult(null)
  }

  const progress = result ? 100 : ((currentStep) / QUESTIONS.length) * 100
  const question = QUESTIONS[currentStep]

  const riskColors = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
    medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
    high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div>
        <Link href="/motoring" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Motoring Hub
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <Navigation className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Smart Issue Router</h1>
            <p className="text-sm text-muted-foreground">Answer a few questions and we&apos;ll identify the right authority and legal position</p>
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question */}
      {!result && question && (
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground">Question {currentStep + 1} of {QUESTIONS.length}</p>
            <h2 className="mt-2 text-lg font-semibold">{question.question}</h2>
            <div className="mt-4 space-y-2">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(question.id, option.value)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:hover:border-brand-800 dark:hover:bg-brand-900/10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Previous question
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <Card className={cn("border", riskColors[result.riskLevel])}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Your Issue Classification</h2>
                <Badge variant={result.riskLevel === "high" ? "destructive" : result.riskLevel === "medium" ? "warning" : "brand"}>
                  {result.riskLevel.toUpperCase()} PRIORITY
                </Badge>
              </div>
              <p className="mt-2 text-base font-semibold">{result.issueCategory}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recommended Authority</h3>
                <p className="mt-1 font-semibold">{result.recommendedAuthority.name}</p>
                <p className="text-sm text-muted-foreground">{result.recommendedAuthority.role}</p>
              </div>

              {result.secondaryAuthority && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Secondary Authority</h3>
                  <p className="mt-1 font-semibold">{result.secondaryAuthority.name}</p>
                  <p className="text-sm text-muted-foreground">{result.secondaryAuthority.role}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Suggested Action</h3>
                <p className="mt-1 text-sm">{result.suggestedAction}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Legal Position</h3>
                <p className="mt-1 text-sm">{result.legalPosition}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href={`/issues/new?category=${encodeURIComponent("Motoring & Vehicle Issues")}&type=${encodeURIComponent(result.issueCategory)}`} className="flex-1">
              <Button className="w-full" size="lg">
                Start Your Complaint <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </div>

          <Link href={`/motoring/issues/${result.categorySlug}`}>
            <Card className="card-hover mt-2">
              <CardContent className="flex items-center gap-3 p-4">
                <p className="flex-1 text-sm font-medium">
                  View full guidance for {result.issueCategory}
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
