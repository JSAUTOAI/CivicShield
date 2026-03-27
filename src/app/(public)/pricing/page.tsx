import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  X,
  ArrowRight,
  Shield,
  Crown,
  Building2,
  Sparkles,
} from "lucide-react"

const tiers = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    description: "Try the full platform with 3 complaint sends",
    icon: Shield,
    highlighted: false,
    cta: "Get Started Free",
    href: "/register",
    features: [
      { text: "3 lifetime complaint sends", included: true },
      { text: "Full AI legal analysis", included: true },
      { text: "Case builder access", included: true },
      { text: "Auto-send via email", included: true },
      { text: "Legal resources & dictionary", included: true },
      { text: "5 files per issue (200MB)", included: true },
      { text: "Monthly complaint allowance", included: false },
      { text: "Follow-up emails", included: false },
      { text: "PDF export", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Basic",
    price: "£4.99",
    period: "/month",
    description: "For individuals with ongoing complaints",
    icon: Sparkles,
    highlighted: false,
    cta: "Get Basic",
    href: "/register",
    features: [
      { text: "5 complaints/month", included: true },
      { text: "10 follow-ups per complaint", included: true },
      { text: "Full AI legal analysis", included: true },
      { text: "Auto-send via email", included: true },
      { text: "Basic complaint tracking", included: true },
      { text: "5 files per issue (200MB)", included: true },
      { text: "Legal resources & dictionary", included: true },
      { text: "Case builder (view only)", included: "partial" as const },
      { text: "PDF export", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: "£14.99",
    period: "/month",
    description: "Full platform access with case management",
    icon: Crown,
    highlighted: true,
    cta: "Get Pro",
    href: "/register",
    features: [
      { text: "15 complaints/month", included: true },
      { text: "20 follow-ups per complaint", included: true },
      { text: "Full AI legal analysis", included: true },
      { text: "Auto-send via email", included: true },
      { text: "Full complaint tracking", included: true },
      { text: "15 files per issue (500MB)", included: true },
      { text: "Full case builder", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support (48hr)", included: true },
      { text: "Bulk send", included: false },
    ],
  },
  {
    name: "Agency",
    price: "£19.99",
    period: "/month",
    description: "For auditors, advocates & advice centres",
    icon: Building2,
    highlighted: false,
    cta: "Get Agency",
    href: "/register",
    features: [
      { text: "30 complaints/month", included: true },
      { text: "50 follow-ups per complaint", included: true },
      { text: "Full AI legal analysis", included: true },
      { text: "Auto-send via email", included: true },
      { text: "Full complaint tracking", included: true },
      { text: "50 files per issue (2GB)", included: true },
      { text: "Full case builder", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support (24hr)", included: true },
      { text: "Bulk send", included: true },
    ],
  },
]

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your settings at any time. You'll keep access until the end of your billing period, and your data stays accessible in read-only mode permanently.",
  },
  {
    q: "What happens after my 3 free sends?",
    a: "You can still access all your existing complaints and case files, browse legal resources, and use the dictionary. To generate or send new complaints, you'll need to subscribe.",
  },
  {
    q: "What counts as a follow-up?",
    a: "When you generate a new response within an existing complaint thread (e.g. replying to an organisation's response), that counts as a follow-up. Starting a brand new complaint counts against your monthly limit.",
  },
  {
    q: "Is CivicShield legal advice?",
    a: "No. CivicShield is a legal information and complaint drafting tool. It provides structured information based on UK legislation and case law, but it is not a substitute for qualified legal advice. Always verify the information independently.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. All data is encrypted in transit and stored securely on EU-based servers. We comply with UK GDPR. You can export or delete your data at any time from your settings.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button variant="brand" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 text-center sm:px-6 lg:px-8">
        <Badge variant="brand" className="mb-4">Pricing</Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Start free with 3 full complaint sends. Upgrade when you need more.
          Every plan includes AI-powered legal analysis.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  tier.highlighted
                    ? "border-2 border-brand-500 shadow-lg shadow-brand-500/10"
                    : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <Badge variant="brand" className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${tier.highlighted ? "text-brand-500" : "text-muted-foreground"}`} />
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2 text-sm">
                      {feature.included === true ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      ) : feature.included === "partial" ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/60"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={tier.href} className="mt-auto">
                  <Button
                    variant={tier.highlighted ? "brand" : "outline"}
                    className="w-full gap-2"
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-lg border border-border p-5">
              <h3 className="font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to hold them accountable?</h2>
          <p className="mt-3 text-brand-100">
            Start with 3 free complaint sends. No credit card required.
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg" className="mt-6 gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>CivicShield is a legal information tool. It does not provide legal advice. Always verify information independently.</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/landing" className="hover:text-foreground">Home</Link>
          </div>
          <p className="mt-4">© {new Date().getFullYear()} CivicShield. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
