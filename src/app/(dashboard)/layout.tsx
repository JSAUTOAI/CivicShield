import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}
