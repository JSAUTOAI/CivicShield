"use client"

import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CivicShield at civicshield.co.uk (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, you must not use the Service.
          </p>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the Service after changes
            constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">2. Service Description</h2>
          <p>
            CivicShield is a legal process assistant that helps users log issues, receive structured
            AI-powered analysis, generate formal complaint letters, and track responses from organisations.
          </p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Important Disclaimer
            </p>
            <p className="mt-1 text-amber-700 dark:text-amber-400">
              CivicShield is a legal process assistant, not a legal advisor. The AI analysis and
              complaint generation features are tools to help you structure your complaints and
              understand potential legal frameworks. They do not constitute legal advice.
              For advice on your specific legal situation, consult a qualified solicitor or
              legal professional.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">3. User Accounts</h2>
          <p>
            To use CivicShield, you must create an account with a valid email address and password.
            You are responsible for:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Providing accurate and up-to-date information</li>
            <li>Notifying us immediately of any unauthorised use of your account</li>
          </ul>
          <p className="mt-2">
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">4. Acceptable Use</h2>
          <p>You agree not to use CivicShield to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Submit false, fraudulent, or vexatious complaints</li>
            <li>Harass, threaten, or defame any individual or organisation</li>
            <li>Violate any applicable law or regulation</li>
            <li>Attempt to gain unauthorised access to the platform or other users&apos; data</li>
            <li>Use automated systems to scrape, collect, or extract data from the Service</li>
            <li>Upload malicious content, including malware or harmful code</li>
          </ul>
          <p className="mt-2">
            We reserve the right to remove content or suspend accounts that violate acceptable use policies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">5. Subscriptions and Payments</h2>
          <p>
            CivicShield offers a free tier with limited features, and paid subscription plans
            (Pro at &pound;4.99/month and Agency at &pound;14.99/month) with expanded capabilities.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Payments are processed securely through Stripe</li>
            <li>Subscriptions renew automatically unless cancelled before the renewal date</li>
            <li>You may cancel your subscription at any time through your account settings</li>
            <li>Refunds are handled on a case-by-case basis in accordance with UK consumer law</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">6. Intellectual Property</h2>
          <p>
            The CivicShield platform, including its design, code, content, and branding, is owned by
            CivicShield and protected by UK intellectual property laws.
          </p>
          <p className="mt-2">
            Content you create (issue descriptions, complaint letters you edit) remains yours.
            By using the Service, you grant CivicShield a limited licence to process and store your
            content as necessary to provide the Service.
          </p>
          <p className="mt-2">
            AI-generated analysis and complaint templates are provided as tools for your use.
            You are free to use, modify, and send the generated content.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>CivicShield is provided &quot;as is&quot; without warranties of any kind, express or implied</li>
            <li>We do not guarantee the accuracy, completeness, or suitability of AI-generated analysis or complaint letters</li>
            <li>We are not liable for the outcome of any complaint or legal matter</li>
            <li>We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service</li>
            <li>Our total liability for any claim is limited to the amount you have paid us in the 12 months preceding the claim</li>
          </ul>
          <p className="mt-2">
            Nothing in these terms excludes or limits liability for death or personal injury caused by
            negligence, fraud, or any other liability that cannot be excluded by law.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">8. Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of
            England and Wales. Any disputes arising from these terms or your use of the Service
            shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">9. Changes to Terms</h2>
          <p>
            We may revise these Terms of Service at any time by updating this page. Material changes
            will be communicated via email or through a notice on the platform. Your continued use
            of the Service after any changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">10. Contact</h2>
          <p>
            If you have any questions about these Terms of Service, contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a href="mailto:support@civicshield.co.uk" className="font-medium text-foreground underline">
              support@civicshield.co.uk
            </a>
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-border pt-6 flex items-center gap-4">
        <Link href="/" className="text-sm font-medium text-foreground hover:underline">
          &larr; Back to CivicShield
        </Link>
        <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
