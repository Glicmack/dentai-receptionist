import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Patient Portal - DentAI",
}

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {children}
    </div>
  )
}
