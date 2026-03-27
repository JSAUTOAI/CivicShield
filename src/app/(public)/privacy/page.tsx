"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">1. Introduction</h2>
          <p>
            CivicShield (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, store, and protect your personal data
            when you use the CivicShield platform at civicshield.co.uk.
          </p>
          <p className="mt-2">
            We are a UK-based legal process assistant and comply with the UK General Data Protection
            Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">2. What Data We Collect</h2>
          <p>We collect the following categories of personal data:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Account information:</strong> Name, email address, username, and password (hashed)</li>
            <li><strong>Profile information:</strong> Phone number and address (optional, provided by you)</li>
            <li><strong>Issue data:</strong> Descriptions of issues you submit, including names of organisations, dates, and circumstances</li>
            <li><strong>Complaint data:</strong> Generated complaint letters, recipient details, and correspondence records</li>
            <li><strong>Usage data:</strong> Pages visited, features used, and interaction patterns to improve the service</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information, and cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">3. How We Use Your Data</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To provide and operate the CivicShield platform</li>
            <li>To generate AI-powered legal analysis of your issues</li>
            <li>To create and send complaint letters on your behalf</li>
            <li>To manage your account and communicate with you about the service</li>
            <li>To improve our service through anonymised usage analytics</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">4. Legal Basis (UK GDPR)</h2>
          <p>We process your personal data on the following legal bases:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Contract:</strong> Processing necessary to provide the CivicShield service you have signed up for (Article 6(1)(b))</li>
            <li><strong>Legitimate interests:</strong> Improving our service, preventing fraud, and ensuring security (Article 6(1)(f))</li>
            <li><strong>Consent:</strong> Where you opt in to optional features such as marketing communications (Article 6(1)(a))</li>
            <li><strong>Legal obligation:</strong> Where we are required to retain data by law (Article 6(1)(c))</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">5. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to provide the service.
            If you delete your account, we will delete or anonymise your personal data within 30 days,
            except where we are required by law to retain certain records.
          </p>
          <p className="mt-2">
            Issue and complaint data is retained for the duration of your account to allow tracking and follow-up.
            Usage analytics are anonymised and retained for up to 24 months.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">6. Your Rights</h2>
          <p>Under the UK GDPR, you have the following rights:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you (Subject Access Request)</li>
            <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Right to erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Right to restrict processing:</strong> Request that we limit how we use your data</li>
            <li><strong>Right to data portability:</strong> Request your data in a machine-readable format</li>
            <li><strong>Right to object:</strong> Object to processing based on legitimate interests</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:support@civicshield.co.uk" className="font-medium text-foreground underline">
              support@civicshield.co.uk
            </a>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">7. Cookies</h2>
          <p>
            We use essential cookies to operate the platform (authentication, session management, and theme preferences).
            These are strictly necessary and do not require consent.
          </p>
          <p className="mt-2">
            We may use analytics cookies to understand how users interact with CivicShield. These are only set with your consent.
            You can manage cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">8. Third Parties</h2>
          <p>We share data with the following third parties, only as necessary to provide the service:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Anthropic (Claude AI):</strong> Issue descriptions are sent for AI analysis. Anthropic processes data under their API terms and does not retain prompts for training.</li>
            <li><strong>Vercel:</strong> Hosting provider for the application</li>
            <li><strong>Railway:</strong> Database hosting provider</li>
            <li><strong>Stripe:</strong> Payment processing for subscriptions (Pro and Agency plans)</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal data to any third party. All third-party processors are bound by data processing agreements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">9. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data,
            including encryption in transit (TLS), hashed passwords, secure database access controls,
            and regular security reviews.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">10. Contact</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to exercise your data rights, contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a href="mailto:support@civicshield.co.uk" className="font-medium text-foreground underline">
              support@civicshield.co.uk
            </a>
          </p>
          <p className="mt-2">
            If you are unsatisfied with our response, you have the right to lodge a complaint with the
            Information Commissioner&apos;s Office (ICO) at{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline">
              ico.org.uk
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <Link href="/" className="text-sm font-medium text-foreground hover:underline">
          &larr; Back to CivicShield
        </Link>
      </div>
    </div>
  )
}
