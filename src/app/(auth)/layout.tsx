import { Logo } from "@/components/layout/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-white">
        <Logo size="lg" />
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Protect your rights.
            <br />
            Hold power accountable.
          </h1>
          <p className="mt-4 text-lg text-brand-200 leading-relaxed">
            CivicShield helps you understand your civil and human rights, generate
            professional complaints, and track institutional accountability across
            the UK.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold">10k+</p>
              <p className="text-sm text-brand-200">Issues tracked</p>
            </div>
            <div>
              <p className="text-3xl font-bold">95%</p>
              <p className="text-sm text-brand-200">Response rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-brand-200">Organizations held accountable</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-brand-300">
          &copy; {new Date().getFullYear()} CivicShield. All rights reserved.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
