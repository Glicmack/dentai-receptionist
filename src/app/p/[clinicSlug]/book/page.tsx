"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChatWidget } from "@/components/widget/ChatWidget"
import { Skeleton } from "@/components/ui/skeleton"

interface ClinicConfig {
  name: string
  slug: string
  phone: string | null
  greeting: string
  tone: string
}

export default function PatientBookPage() {
  const params = useParams()
  const clinicSlug = params.clinicSlug as string
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadClinic() {
      try {
        const response = await fetch(`/api/widget/${clinicSlug}`)
        if (!response.ok) {
          setError("Clinic not found")
          return
        }
        const data = await response.json()
        setClinicConfig({
          name: data.name,
          slug: data.slug,
          phone: data.phone,
          greeting: data.greeting,
          tone: data.tone,
        })
      } catch {
        setError("Failed to load clinic data")
      }
    }
    loadClinic()
  }, [clinicSlug])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!clinicConfig) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-b bg-white p-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href={`/p/${clinicSlug}/appointments`}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="font-semibold">Book an Appointment</h1>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="flex-1">
        <ChatWidget clinicConfig={clinicConfig} />
      </div>
    </div>
  )
}
