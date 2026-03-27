"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Brain,
  Mail,
  BookOpen,
  Shield,
  MessageSquare,
  Workflow,
} from "lucide-react"

interface FaqSection {
  id: string
  title: string
  icon: React.ElementType
  content: string[]
}

const faqSections: FaqSection[] = [
  {
    id: "how-it-works",
    title: "How CivicShield Works",
    icon: Workflow,
    content: [
      "CivicShield is a structured complaint automation platform designed to help UK citizens hold organisations accountable.",
      "The process follows a clear pipeline: first, you log an issue describing what happened to you. Our AI then analyses your issue against relevant UK legislation, common law, and regulatory frameworks to identify potential legal grounds.",
      "Based on the analysis, CivicShield generates a formal complaint letter addressed to the appropriate organisation. You can review and edit the letter before sending it.",
      "Once sent, you can track responses, set follow-up reminders, and escalate if necessary. CivicShield keeps a record of all correspondence for your reference.",
    ],
  },
  {
    id: "creating-issue",
    title: "Creating an Issue",
    icon: FileText,
    content: [
      "To create a new issue, click 'New Issue' from the dashboard or the issues page. You will be guided through a step-by-step wizard.",
      "Step 1: Select the category that best describes your issue (e.g., Public Sector, Business & Commerce, Employment, Legal & Justice, or Personal).",
      "Step 2: Choose the specific sub-type within that category (e.g., Police, Council, Employer, Bank, etc.).",
      "Step 3: Provide a clear title and a detailed description of what happened. Include dates, names of organisations, and any reference numbers you have.",
      "Step 4: Review your issue and submit it. You can then run AI analysis to identify legal frameworks and generate a complaint.",
      "Tip: The more detail you provide, the better the AI analysis will be. Include specific facts, dates, and any correspondence you have received.",
    ],
  },
  {
    id: "ai-analysis",
    title: "Understanding AI Analysis",
    icon: Brain,
    content: [
      "When you run AI analysis on an issue, CivicShield uses advanced language models to examine your situation against UK legal frameworks.",
      "The AI identifies: a structured summary of your situation, key facts extracted from your description, potential legal issues and rights that may apply, relevant legislation and regulatory frameworks, and suggested actions you can take.",
      "Important: AI analysis is NOT legal advice. It is a structured assessment designed to help you understand your situation and identify potential avenues for complaint. The AI does not make definitive legal conclusions.",
      "The analysis references real UK legislation, case law, and regulatory standards. However, law is complex and fact-specific — always consider seeking professional legal advice for serious matters.",
      "You can re-run analysis if you update your issue description with additional information.",
    ],
  },
  {
    id: "complaints",
    title: "Complaint Letters",
    icon: Mail,
    content: [
      "After AI analysis, CivicShield automatically generates a formal complaint letter based on the legal issues identified.",
      "The complaint letter includes: your details (from your profile), the recipient organisation, a structured summary of the complaint, relevant legal references, and a clear request for resolution.",
      "You can edit the complaint letter before sending it. We recommend reviewing the content to ensure accuracy and adding any personal details the AI may not have captured.",
      "On the Free plan, you can copy the complaint text and send it yourself via email or post. Pro and Agency plans include direct email sending through CivicShield.",
      "All complaint letters are saved in your Complaints section, where you can manage drafts, view sent complaints, and track responses.",
    ],
  },
  {
    id: "dictionary",
    title: "Legal Dictionary",
    icon: BookOpen,
    content: [
      "The Legal Dictionary provides plain-language definitions of UK legal terms that you may encounter during the complaint process.",
      "Terms are organised by category (Constitutional, Civil Rights, Criminal Law, Employment, Housing, Consumer, Data Protection, and Procedure) and can be searched or browsed alphabetically.",
      "Each term includes: a clear definition in everyday language, the category it belongs to, related tags for cross-referencing, and links to relevant legislation where applicable.",
      "The dictionary is designed to help you understand legal language without needing a law degree. It covers terms commonly encountered in complaints, regulatory responses, and legal correspondence.",
    ],
  },
  {
    id: "privacy",
    title: "Account & Privacy",
    icon: Shield,
    content: [
      "CivicShield takes data protection seriously. We comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.",
      "Your personal data is stored securely and is only used to provide the CivicShield service. We do not sell your data to third parties.",
      "You can update your profile information, change your password, and manage your preferences from the Settings page.",
      "You have the right to: access your data (Subject Access Request), request correction of inaccurate data, request deletion of your account and associated data, and export your data in a portable format.",
      "To request data deletion or export, contact us at support@civicshield.co.uk. We will process your request within 30 days as required by law.",
    ],
  },
  {
    id: "contact",
    title: "Contact & Feedback",
    icon: MessageSquare,
    content: [
      "We welcome feedback and are here to help if you encounter any issues with the platform.",
      "Email: support@civicshield.co.uk",
      "For bug reports, please include: a description of what happened, what you expected to happen, the page or feature you were using, and your browser/device information.",
      "For feature requests, describe what you would like to see and how it would help your use of CivicShield. We prioritise features based on user feedback.",
      "Response times: We aim to respond to all enquiries within 2 business days.",
    ],
  },
]

export default function HelpPage() {
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set(["how-it-works"]))

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
          Help & Support
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to know about using CivicShield to protect your rights
        </p>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        {faqSections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => {
                setOpenSections(new Set([section.id]))
                document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "center" })
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-left text-sm font-medium text-foreground transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:hover:border-brand-700 dark:hover:bg-brand-900/10"
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
              <span className="line-clamp-1">{section.title}</span>
            </button>
          )
        })}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        {faqSections.map((section, index) => {
          const Icon = section.icon
          const isOpen = openSections.has(section.id)
          return (
            <Card
              key={section.id}
              id={section.id}
              className="animate-fade-in overflow-hidden"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                    <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                )}
              </button>
              {isOpen && (
                <CardContent className="border-t border-border px-5 pb-5 pt-4">
                  <div className="space-y-3">
                    {section.content.map((paragraph, i) => (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Contact CTA */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
          <HelpCircle className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Still need help?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get in touch with our support team and we&apos;ll get back to you within 2 business days.
        </p>
        <a
          href="mailto:support@civicshield.co.uk"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <Mail className="h-4 w-4" />
          support@civicshield.co.uk
        </a>
      </div>
    </div>
  )
}
