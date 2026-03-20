import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  FileText,
  Brain,
  Send,
  BarChart3,
  Scale,
  Users,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Lock,
  Globe,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Legal Analysis",
    description:
      "Our AI analyses your issue against UK legislation, case law, and regulations to identify rights violations and build your case.",
  },
  {
    icon: FileText,
    title: "Solicitor-Grade Complaints",
    description:
      "Automatically generates professional formal complaints, addressed to the right person, with the correct oversight bodies CC'd.",
  },
  {
    icon: Send,
    title: "Auto-Route & Track",
    description:
      "Complaints are sent directly to the correct department. Track when they're opened, and whether you get a response.",
  },
  {
    icon: Scale,
    title: "Case Building",
    description:
      "Stack evidence, precedents, and legal defences together. Build a real legal case without needing a solicitor.",
  },
  {
    icon: BarChart3,
    title: "Accountability Data",
    description:
      "See how many complaints organisations receive and ignore. Expose patterns of institutional non-compliance at scale.",
  },
  {
    icon: Users,
    title: "Community Petitions",
    description:
      "Join campaigns, sign petitions, and add your voice to collective action against organisations breaking the law.",
  },
]

const stats = [
  { value: "10,000+", label: "Issues Tracked" },
  { value: "95%", label: "Complaint Response Rate" },
  { value: "500+", label: "Organisations Monitored" },
  { value: "£0", label: "Cost to Get Started" },
]

const categories = [
  "Police Conduct",
  "Local Councils",
  "Bailiff/Enforcement",
  "Banks & Financial",
  "Utility Companies",
  "Employment",
  "Solicitors",
  "Schools",
  "Telecom",
  "Insurance",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button variant="brand">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-50/30 dark:from-brand-900/10 dark:via-background dark:to-brand-900/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="brand" className="mb-4 px-3 py-1 text-sm">
              AI-Powered Civic Rights Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Protect Your Rights.
              <br />
              <span className="gradient-text">Hold Power Accountable.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              CivicShield uses AI to analyse your legal rights, generate
              professional complaints, and track institutional accountability
              across the UK. No solicitor needed.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="brand" size="xl" className="gap-2">
                  Start Protecting Your Rights
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to use. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 sm:px-6 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to fight back
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From logging an issue to building a legal case — CivicShield handles
            the entire process.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="card-hover">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                    <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How CivicShield Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Four simple steps from issue to resolution
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Log Your Issue",
                description: "Describe what happened, who was involved, and when. Upload any evidence you have.",
                icon: FileText,
              },
              {
                step: "2",
                title: "AI Analyses Your Rights",
                description: "Our AI identifies relevant laws, case precedents, and rights violations specific to your situation.",
                icon: Brain,
              },
              {
                step: "3",
                title: "Complaint Generated & Sent",
                description: "A professional complaint is auto-generated and sent to the right people, with oversight bodies CC'd.",
                icon: Send,
              },
              {
                step: "4",
                title: "Track & Escalate",
                description: "Monitor responses, build your case with stacked evidence, and escalate if needed.",
                icon: BarChart3,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-xl font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Covering Every Type of Complaint
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether it&apos;s the police, your council, a bailiff, or a corporation — we&apos;ve got you covered.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <div
              key={cat}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-all hover:border-brand-300 hover:shadow-sm"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to protect your rights?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-200">
            Join thousands of UK citizens who are using CivicShield to hold
            organisations accountable and assert their rights.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="xl"
                className="gap-2 bg-white text-brand-700 hover:bg-brand-50"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/help" className="hover:text-foreground transition-colors">
                Help & Support
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CivicShield. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
