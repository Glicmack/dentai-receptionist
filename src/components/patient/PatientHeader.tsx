"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PatientHeaderProps {
  clinicName: string
  clinicSlug: string
  patientName?: string
}

export function PatientHeader({ clinicName, clinicSlug, patientName }: PatientHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/patient/logout", { method: "POST" })
    router.push(`/p/${clinicSlug}`)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
            <span className="text-sm font-bold text-white">
              {clinicName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">{clinicName}</h1>
            <p className="text-xs text-muted-foreground">Patient Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {patientName && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              Hi, {patientName}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
