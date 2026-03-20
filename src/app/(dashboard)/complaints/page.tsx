"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Edit,
  Send,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react"

type TabType = "all" | "drafts" | "sent"

const complaints = [
  {
    id: 1,
    organization: "South wales police",
    type: "Police Conduct",
    createdAt: "2025-04-13",
    status: "draft" as const,
    preview: "PERSONAL INFORMATION SECTION (User can edit or remove) ===== Full Name: Jake S Address: [Your address] Email: jake@example.com Phone: [Your phone number] If you wish to remain anonymous. de...",
  },
  {
    id: 2,
    organization: "South wales police",
    type: "Police Conduct",
    createdAt: "2025-04-13",
    status: "draft" as const,
    preview: "[Today's Date] Office of Professional Standards South Wales Police Police Headquarters Bridgend CF31 3SU Dear Sir/Madam, Subject: Formal Complaint Regarding Inappropriate Conduct by South...",
  },
  {
    id: 3,
    organization: "swansea council",
    type: "Local Council",
    createdAt: "2025-04-13",
    status: "sent" as const,
    sentAt: "2025-04-13",
    sentVia: "api",
    preview: "plaintext ===== PERSONAL INFORMATION SECTION ===== Full Name: Jake S Address: [Your address] Email: jake@example.com Phone: [Your phone number] If you wish to remain anon...",
  },
  {
    id: 4,
    organization: "south wales school boards",
    type: "School Board",
    createdAt: "2025-04-14",
    status: "draft" as const,
    preview: "[Your Name] [Your Address] [Your Email] [Your Phone Number] [Date] South Wales School Boards [Their Address] [City, Postal Code] Dear Members of the South Wales School Boards, I am writing t...",
  },
  {
    id: 5,
    organization: "acuity law",
    type: "Solicitor",
    createdAt: "2025-09-28",
    status: "draft" as const,
    preview: "[Your Address] [City, Postcode] [Email Address] [Phone Number] [Date] The Office of the Legal Ombudsman PO Box 6806 Wolverhampton WV1 9WJ Dear Sir/Madam, Subject: Formal Complaint ...",
  },
  {
    id: 6,
    organization: "exodus",
    type: "Bailiff/Enforcement",
    createdAt: "2025-04-14",
    status: "draft" as const,
    preview: "[Your Address] [City, Postcode] [Date] Exodus Enforcement Agency [Agency's Address] [City, Postcode] Dear Sir/Madam, Subject: Formal Complaint Regarding Bailiff Misconduct and Rights Viol...",
  },
]

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("all")

  const filtered = complaints.filter((c) => {
    if (activeTab === "drafts") return c.status === "draft"
    if (activeTab === "sent") return c.status === "sent"
    return true
  })

  const tabs: { value: TabType; label: string; count: number }[] = [
    { value: "all", label: "All Complaints", count: complaints.length },
    { value: "drafts", label: "Drafts", count: complaints.filter((c) => c.status === "draft").length },
    { value: "sent", label: "Sent", count: complaints.filter((c) => c.status === "sent").length },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-lg bg-muted p-1 w-fit animate-fade-in" style={{ animationDelay: "0.05s" }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeTab === tab.value
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                : "bg-muted text-muted-foreground"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Complaints list */}
      <div className="space-y-4 stagger-fade-in">
        {filtered.map((complaint) => (
          <Card key={complaint.id} className="card-hover overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {complaint.organization}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {complaint.type} - Created on{" "}
                    {new Date(complaint.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant={complaint.status === "sent" ? "success" : "default"}
                >
                  {complaint.status === "sent" ? "Sent" : "Draft"}
                </Badge>
              </div>

              <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {complaint.preview}
              </p>

              {complaint.status === "sent" && "sentAt" in complaint && (
                <div className="mb-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Sent on {new Date(complaint.sentAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  via {complaint.sentVia}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Link href={`/issues/${complaint.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    View Issue
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    Edit Complaint
                  </Button>
                  {complaint.status === "draft" && (
                    <Button variant="brand" size="sm" className="gap-1.5">
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" className="gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
