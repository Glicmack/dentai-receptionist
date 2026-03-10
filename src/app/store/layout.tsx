"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [patient, setPatient] = useState<{ fullName: string; email: string } | null>(null)
  const isAuthPage = pathname === "/store/login" || pathname === "/store/register"

  useEffect(() => {
    fetch("/api/patient/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setPatient(d.patient))
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch("/api/patient/logout", { method: "POST" })
    setPatient(null)
    router.push("/store")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="text-lg font-bold">DentAI</span>
            <span className="text-xs text-gray-400 hidden sm:inline">Find Your Dentist</span>
          </Link>

          <nav className="flex items-center gap-3">
            {patient ? (
              <>
                <Link href="/store/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  My Dashboard
                </Link>
                <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-medium">
                    {patient.fullName[0]}
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:inline">{patient.fullName}</span>
                </div>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
                  Logout
                </button>
              </>
            ) : !isAuthPage ? (
              <>
                <Link href="/store/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/store/register" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
